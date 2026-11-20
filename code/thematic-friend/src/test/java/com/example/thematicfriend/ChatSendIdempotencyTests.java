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
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:chat-send-idempotency-tests;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class ChatSendIdempotencyTests {
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
    @Autowired EntityManager entityManager;

    Member sender;
    Member recipient;
    ExecutorService executor;

    @BeforeEach
    void setUp() {
        messages.deleteAll();
        readStates.deleteAll();
        blocks.deleteAll();
        connectionRepo.deleteAll();
        decisions.deleteAll();
        members.deleteAll();
        sender = create("idempotency_sender", "Fictional Sender");
        recipient = create("idempotency_recipient", "Fictional Recipient");
    }

    @AfterEach
    void stopExecutor() {
        if (executor != null) executor.shutdownNow();
    }

    @Test
    void sameIdentityReturnsOneMessageAndChangedContentIsRejected() {
        Connection link = match(sender, recipient);

        ChatService.MessageView first = chat.send(sender.getUsername(), link.getId(), "Hello", "send-1");
        ChatService.MessageView replay = chat.send(sender.getUsername(), link.getId(), "Hello", "send-1");

        assertThat(replay.id()).isEqualTo(first.id());
        assertThat(replay.clientMessageId()).isEqualTo("send-1");
        assertThat(messages.count()).isEqualTo(1);
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);

        assertThatThrownBy(() -> chat.send(sender.getUsername(), link.getId(), "Different", "send-1"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThat(messages.count()).isEqualTo(1);
    }

    @Test
    void simultaneousDuplicatesShareOnePersistedMessage() throws Exception {
        Connection link = match(sender, recipient);
        int workers = 8;
        executor = Executors.newFixedThreadPool(workers);
        CountDownLatch ready = new CountDownLatch(workers);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<ChatService.MessageView>> results = new ArrayList<>();

        for (int index = 0; index < workers; index++) {
            results.add(executor.submit(() -> {
                ready.countDown();
                start.await();
                return chat.send(sender.getUsername(), link.getId(), "Concurrent hello", "concurrent-send");
            }));
        }
        ready.await();
        start.countDown();

        List<Long> ids = new ArrayList<>();
        for (Future<ChatService.MessageView> result : results) ids.add(result.get().id());
        assertThat(ids).containsOnly(ids.getFirst());
        assertThat(messages.count()).isEqualTo(1);
        assertThat(chat.read(recipient.getUsername(), link.getId(), null)).hasSize(1);
    }

    @Test
    void identityIsScopedToSenderAndConversation() {
        Member outsider = create("idempotency_outsider", "Fictional Outsider");
        Connection first = match(sender, recipient);
        Connection second = match(recipient, outsider);

        ChatService.MessageView senderMessage = chat.send(sender.getUsername(), first.getId(), "From sender", "shared-key");
        ChatService.MessageView recipientMessage = chat.send(recipient.getUsername(), first.getId(), "From recipient", "shared-key");
        ChatService.MessageView otherConversation = chat.send(recipient.getUsername(), second.getId(), "Other conversation", "shared-key");

        assertThat(List.of(senderMessage.id(), recipientMessage.id(), otherConversation.id())).doesNotHaveDuplicates();
        assertThat(messages.count()).isEqualTo(3);
    }

    @Test
    void oldRowsRemainValidAndReplaySurvivesRepositoryReload() {
        Connection link = match(sender, recipient);
        messages.saveAndFlush(new Message(link.getId(), sender.getId(), "Legacy one"));
        messages.saveAndFlush(new Message(link.getId(), sender.getId(), "Legacy two"));
        assertThat(messages.count()).isEqualTo(2);

        ChatService.MessageView first = chat.send(sender.getUsername(), link.getId(), "Persistent hello", "persistent-send");
        entityManager.clear();
        ChatService.MessageView replay = chat.send(sender.getUsername(), link.getId(), "Persistent hello", "persistent-send");

        assertThat(replay.id()).isEqualTo(first.id());
        assertThat(messages.count()).isEqualTo(3);
    }

    @Test
    void apiReplayIsIdempotentAndChangedContentReturnsConflict() throws Exception {
        Connection link = match(sender, recipient);
        String api = "/api/conversations/" + link.getId() + "/messages";

        String firstJson = mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "API hello").param("clientMessageId", "api-send"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientMessageId").value("api-send"))
                .andReturn().getResponse().getContentAsString();
        long id = Long.parseLong(firstJson.replaceAll(".*\\\"id\\\":(\\d+).*", "$1"));

        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "API hello").param("clientMessageId", "api-send"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "Changed").param("clientMessageId", "api-send"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.error").isString());

        assertThat(messages.count()).isEqualTo(1);
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);
    }

    @Test
    void nativeFormAndLostResponseRetryStillProduceOneRow() throws Exception {
        Connection link = match(sender, recipient);
        String api = "/api/conversations/" + link.getId() + "/messages";
        String form = "/conversations/" + link.getId() + "/messages";

        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "Response lost").param("clientMessageId", "lost-response"))
                .andExpect(status().isOk());
        // The second request represents the browser retrying after it could not read the first response.
        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "Response lost").param("clientMessageId", "lost-response"))
                .andExpect(status().isOk());
        mvc.perform(post(form).with(user(sender.getUsername())).with(csrf())
                        .param("body", "Response lost").param("clientMessageId", "lost-response"))
                .andExpect(redirectedUrl("/conversations/" + link.getId()));

        assertThat(messages.count()).isEqualTo(1);
        assertThat(chat.read(recipient.getUsername(), link.getId(), null)).hasSize(1);
        assertThat(chat.unreadCount(recipient.getUsername(), link.getId())).isEqualTo(1);
    }

    @Test
    void everyReplayStillRequiresAuthenticationCsrfAndConversationMembership() throws Exception {
        Connection link = match(sender, recipient);
        Member outsider = create("idempotency_outsider_2", "Fictional Outsider");
        String api = "/api/conversations/" + link.getId() + "/messages";

        mvc.perform(post(api).with(user(sender.getUsername())).with(csrf())
                        .param("body", "Protected").param("clientMessageId", "protected-send"))
                .andExpect(status().isOk());
        mvc.perform(post(api).with(csrf())
                        .param("body", "Protected").param("clientMessageId", "protected-send"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post(api).with(user(sender.getUsername()))
                        .param("body", "Protected").param("clientMessageId", "protected-send"))
                .andExpect(status().isForbidden());
        mvc.perform(post(api).with(user(outsider.getUsername())).with(csrf())
                        .param("body", "Protected").param("clientMessageId", "protected-send"))
                .andExpect(status().isNotFound());
        assertThat(messages.count()).isEqualTo(1);
    }

    Member create(String username, String nickname) {
        Member member = new Member(username, encoder.encode("Synthetic-Test-2026"), nickname);
        member.updateProfile(nickname, "Fictional test profile", List.of("Coffee"), "New friends", true);
        return members.saveAndFlush(member);
    }

    Connection match(Member first, Member second) {
        connections.decide(first.getUsername(), second.getId(), Decision.Choice.LIKE);
        return connections.decide(second.getUsername(), first.getId(), Decision.Choice.LIKE).orElseThrow();
    }
}
