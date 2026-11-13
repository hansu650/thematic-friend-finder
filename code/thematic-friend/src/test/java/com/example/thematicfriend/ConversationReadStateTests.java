package com.example.thematicfriend;

import com.example.thematicfriend.account.Member;
import com.example.thematicfriend.account.MemberRepository;
import com.example.thematicfriend.chat.ChatService;
import com.example.thematicfriend.chat.ConversationReadStateRepository;
import com.example.thematicfriend.chat.Message;
import com.example.thematicfriend.chat.MessageRepository;
import com.example.thematicfriend.connection.Connection;
import com.example.thematicfriend.connection.ConnectionRepository;
import com.example.thematicfriend.connection.ConnectionService;
import com.example.thematicfriend.connection.Decision;
import com.example.thematicfriend.connection.DecisionRepository;
import com.example.thematicfriend.safety.BlockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:conversation-read-tests;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ConversationReadStateTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired PasswordEncoder encoder;
    @Autowired DecisionRepository decisions;
    @Autowired ConnectionRepository connectionRepo;
    @Autowired ConnectionService connections;
    @Autowired ChatService chat;
    @Autowired MessageRepository messages;
    @Autowired ConversationReadStateRepository readStates;
    @Autowired BlockRepository blocks;

    Member sender;
    Member recipient;

    @BeforeEach
    void setUp() {
        messages.deleteAll();
        readStates.deleteAll();
        blocks.deleteAll();
        connectionRepo.deleteAll();
        decisions.deleteAll();
        members.deleteAll();
        sender = create("reader_sender", "Fictional Sender");
        recipient = create("reader_recipient", "Fictional Recipient");
    }

    @Test
    void d01IncomingMessagesIncreaseOnlyTheRecipientsUnreadCount() throws Exception {
        Connection link = match(sender, recipient);

        chat.send(sender.getUsername(), link.getId(), "First message from the sender");

        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isZero();
        mvc.perform(get("/connections").with(user(recipient.getUsername())))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("data-unread-count=\"1\"")));
        mvc.perform(get("/connections").with(user(sender.getUsername())))
                .andExpect(status().isOk())
                .andExpect(content().string(not(containsString("data-unread-count=\"1\""))));

        chat.send(recipient.getUsername(), link.getId(), "Reply from the recipient");

        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isEqualTo(1);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 100, 250})
    void d03OlderMessageBoundariesProduceBoundedOrderedPagesWithoutMissingItems(int messageCount) {
        Connection link = match(sender, recipient);
        List<Long> sentIds = new ArrayList<>();
        for (int index = 0; index < messageCount; index++) {
            chat.send(sender.getUsername(), link.getId(), "History message " + (index + 1));
            sentIds.add(latestMessageId(link));
        }

        List<ChatService.MessageView> latest = chat.read(recipient.getUsername(), link.getId(), null);
        int expectedLatestSize = Math.min(messageCount, 100);
        assertThat(latest).hasSize(expectedLatestSize);
        assertThat(latest).extracting(ChatService.MessageView::id).isSorted();

        if (expectedLatestSize == 0) {
            ChatService.HistoryPage empty = chat.history(recipient.getUsername(), link.getId(), Long.MAX_VALUE);
            assertThat(empty.messages()).isEmpty();
            assertThat(empty.hasOlder()).isFalse();
            assertThat(empty.nextBefore()).isNull();
            return;
        }

        List<Long> pagedIds = new ArrayList<>();
        Long before = latest.getFirst().id();
        while (before != null) {
            ChatService.HistoryPage page = chat.history(recipient.getUsername(), link.getId(), before);
            assertThat(page.messages().size()).isLessThanOrEqualTo(100);
            assertThat(page.messages()).extracting(ChatService.MessageView::id).isSorted();
            pagedIds.addAll(0, page.messages().stream().map(ChatService.MessageView::id).toList());
            before = page.nextBefore();
        }

        List<Long> expectedOlderIds = sentIds.subList(0, Math.max(0, messageCount - expectedLatestSize));
        assertThat(pagedIds).containsExactlyElementsOf(expectedOlderIds);
        assertThat(pagedIds).doesNotHaveDuplicates();
    }

    @Test
    void d02ReadAcknowledgementClearsOnlyCurrentParticipantAndLaterMessagesBecomeUnread() throws Exception {
        Connection link = match(sender, recipient);
        chat.send(sender.getUsername(), link.getId(), "First message requiring acknowledgement");
        Long firstMessageId = latestMessageId(link);
        chat.send(recipient.getUsername(), link.getId(), "Message received by the sender");
        Long latestMessageId = latestMessageId(link);

        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isEqualTo(1);

        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(recipient.getUsername()))
                        .with(csrf())
                        .param("throughMessageId", firstMessageId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastReadMessageId").value(firstMessageId))
                .andExpect(jsonPath("$.unreadCount").value(0));

        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isZero();
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isEqualTo(1);

        chat.send(sender.getUsername(), link.getId(), "New message after acknowledgement");
        Long laterMessageId = latestMessageId(link);
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);

        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(recipient.getUsername()))
                        .with(csrf())
                        .param("throughMessageId", firstMessageId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastReadMessageId").value(firstMessageId));
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);

        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(recipient.getUsername()))
                        .with(csrf())
                        .param("throughMessageId", laterMessageId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastReadMessageId").value(laterMessageId))
                .andExpect(jsonPath("$.unreadCount").value(0));
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isZero();
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isEqualTo(1);
    }

    @Test
    void d04HistoryAndPollingOverlapMergeWithoutDuplicatesOrReorderingWhenTimestampsMatch() {
        Connection link = match(sender, recipient);
        Instant sameTimestamp = Instant.parse("2026-11-09T00:00:00Z");
        List<Long> sentIds = new ArrayList<>();
        for (int index = 1; index <= 250; index++) {
            Message message = new Message(link.getId(), sender.getId(), "Equal timestamp message " + index);
            ReflectionTestUtils.setField(message, "sentAt", sameTimestamp);
            sentIds.add(messages.saveAndFlush(message).getId());
        }

        List<ChatService.MessageView> latest = chat.read(recipient.getUsername(), link.getId(), null);
        List<ChatService.MessageView> olderMessages = new ArrayList<>();
        Long before = latest.getFirst().id();
        Long overlapCursor = null;
        while (before != null) {
            ChatService.HistoryPage page = chat.history(recipient.getUsername(), link.getId(), before);
            if (overlapCursor == null) overlapCursor = page.messages().getLast().id();
            olderMessages.addAll(page.messages());
            before = page.nextBefore();
        }
        List<ChatService.MessageView> pollingOverlap = chat.read(recipient.getUsername(), link.getId(), overlapCursor);

        assertThat(latest).allMatch(message -> message.time().equals("11-09 08:00"));
        assertThat(olderMessages).allMatch(message -> message.time().equals("11-09 08:00"));
        assertThat(pollingOverlap).extracting(ChatService.MessageView::id)
                .containsExactlyElementsOf(latest.stream().map(ChatService.MessageView::id).toList());

        Map<Long, ChatService.MessageView> merged = new TreeMap<>();
        olderMessages.forEach(message -> merged.put(message.id(), message));
        latest.forEach(message -> merged.put(message.id(), message));
        pollingOverlap.forEach(message -> merged.put(message.id(), message));

        assertThat(merged.values()).extracting(ChatService.MessageView::id).containsExactlyElementsOf(sentIds);
        assertThat(merged).hasSize(250);
    }

    @Test
    void d05HistoryAndReadStateRejectUnrelatedClosedBlockedAndCsrfMissingRequests() throws Exception {
        Member outsider = create("reader_outsider", "Fictional Outsider");
        Connection link = match(sender, recipient);
        chat.send(sender.getUsername(), link.getId(), "Access boundary message");
        Long messageId = latestMessageId(link);

        mvc.perform(get("/api/conversations/" + link.getId() + "/history").param("before", messageId.toString()))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/conversations/" + link.getId() + "/history")
                        .with(user(outsider.getUsername())).param("before", messageId.toString()))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").exists());
        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(recipient.getUsername()))
                        .param("throughMessageId", messageId.toString()))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(outsider.getUsername())).with(csrf())
                        .param("throughMessageId", messageId.toString()))
                .andExpect(status().isNotFound());

        Connection otherLink = match(sender, outsider);
        chat.send(sender.getUsername(), otherLink.getId(), "Message from another conversation");
        Long otherMessageId = latestMessageId(otherLink);
        mvc.perform(post("/api/conversations/" + link.getId() + "/read")
                        .with(user(recipient.getUsername())).with(csrf())
                        .param("throughMessageId", otherMessageId.toString()))
                .andExpect(status().isBadRequest());

        blocks.saveAndFlush(new com.example.thematicfriend.safety.Block(recipient.getId(), sender.getId()));
        mvc.perform(get("/api/conversations/" + link.getId() + "/history")
                        .with(user(recipient.getUsername())).param("before", messageId.toString()))
                .andExpect(status().isForbidden());

        Connection ended = match(recipient, outsider);
        connections.end(recipient.getUsername(), ended.getId());
        mvc.perform(get("/api/conversations/" + ended.getId() + "/history")
                        .with(user(outsider.getUsername())).param("before", messageId.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void asyncSendPersistsTextAndStickersAndKeepsUserContentEscaped() throws Exception {
        Connection link = match(sender, recipient);
        String api = "/api/conversations/" + link.getId() + "/messages";
        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf()).param("body", "Hello 😊"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.body").value("Hello 😊"))
                .andExpect(jsonPath("$.mine").value(true)).andExpect(jsonPath("$.id").isNumber());
        mvc.perform(post(api).with(user(recipient.getUsername())).with(csrf()).param("body", "[[sticker:coffee]]"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.body").value("[[sticker:coffee]]"));
        assertThat(chat.read(sender.getUsername(), link.getId(), null)).hasSize(2);
        assertThat(chat.unreadCount(sender.getUsername(), link.getId())).isEqualTo(1);
        chat.send(sender.getUsername(), link.getId(), "[[sticker:<img src=x onerror=alert(1)>]]");
        mvc.perform(get("/conversations/" + link.getId()).with(user(recipient.getUsername())))
                .andExpect(status().isOk()).andExpect(content().string(containsString("data-sticker=\"coffee\"")))
                .andExpect(content().string(containsString("&lt;img src=x onerror=alert(1)&gt;")))
                .andExpect(content().string(not(containsString("<img src=x"))));
        mvc.perform(get("/connections").with(user(sender.getUsername()))).andExpect(status().isOk());
    }

    @Test
    void asyncSendRejectsInvalidBodiesAndRespectsAuthenticationCsrfAndConversationBoundaries() throws Exception {
        Member outsider = create("async_outsider", "Outsider");
        Connection link = match(sender, recipient);
        String api = "/api/conversations/" + link.getId() + "/messages";
        mvc.perform(post(api).with(csrf()).param("body", "Hello")).andExpect(status().isUnauthorized());
        mvc.perform(post(api).with(user(sender.getUsername())).param("body", "Hello")).andExpect(status().isForbidden());
        mvc.perform(post(api).with(user(outsider.getUsername())).with(csrf()).param("body", "Hello")).andExpect(status().isNotFound());
        for (String invalid : List.of("   ", "x".repeat(1001))) {
            mvc.perform(post(api).with(user(sender.getUsername())).with(csrf()).param("body", invalid))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").isString());
        }
        assertThat(messages.count()).isZero();
        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf()).param("body", "x".repeat(1000)))
                .andExpect(status().isOk());
        connections.end(sender.getUsername(), link.getId());
        mvc.perform(post(api).with(user(recipient.getUsername())).with(csrf()).param("body", "After closing"))
                .andExpect(status().isForbidden());
        assertThat(messages.count()).isEqualTo(1);
        Connection other = match(recipient, outsider);
        blocks.saveAndFlush(new com.example.thematicfriend.safety.Block(outsider.getId(),recipient.getId()));
        mvc.perform(post("/api/conversations/" + other.getId() + "/messages").with(user(recipient.getUsername())).with(csrf()).param("body", "Blocked"))
                .andExpect(status().isForbidden());
        assertThat(messages.count()).isEqualTo(1);
    }

    Member create(String username, String nickname) {
        Member member = new Member(username, encoder.encode("Synthetic-Test-2026"), nickname);
        member.updateProfile(nickname, "Fictional test profile", List.of("Coffee"), "New friends", true);
        return members.saveAndFlush(member);
    }

    Long latestMessageId(Connection link) {
        return messages.findTopByConnectionIdOrderByIdDesc(link.getId()).orElseThrow().getId();
    }

    Connection match(Member first, Member second) {
        connections.decide(first.getUsername(), second.getId(), Decision.Choice.LIKE);
        return connections.decide(second.getUsername(), first.getId(), Decision.Choice.LIKE).orElseThrow();
    }
}
