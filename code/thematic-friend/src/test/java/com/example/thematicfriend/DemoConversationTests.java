package com.example.thematicfriend;

import com.example.thematicfriend.account.MemberRepository;
import com.example.thematicfriend.bootstrap.DemoConversations;
import com.example.thematicfriend.chat.MessageRepository;
import com.example.thematicfriend.connection.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:demo-conversation-tests;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop", "app.demo-conversations=true"})
@ActiveProfiles("demo")
@Transactional
class DemoConversationTests {
    @DynamicPropertySource static void demoPassword(DynamicPropertyRegistry registry) {
        String value=UUID.randomUUID().toString(); registry.add("app.demo-password",()->value);
    }
    @Autowired DemoConversations fixtures;
    @Autowired MemberRepository members;
    @Autowired ConnectionRepository links;
    @Autowired ConnectionService connections;
    @Autowired MessageRepository messages;
    @Autowired DecisionRepository decisions;

    @Test void optInCreatesActualConversationsAndRestartDoesNotDuplicateOrReopenThem() throws Exception {
        assertThat(members.count()).isEqualTo(28);
        assertThat(links.count()).isEqualTo(3);
        assertThat(messages.count()).isEqualTo(10);
        var link=links.findAll().getFirst();
        var participant=members.findById(link.getLowId()).orElseThrow();
        connections.end(participant.getUsername(),link.getId());
        fixtures.run();
        assertThat(members.count()).isEqualTo(28);
        assertThat(links.count()).isEqualTo(3);
        assertThat(messages.count()).isEqualTo(10);
        assertThat(connections.forMember(participant.getId())).noneMatch(c->c.getId().equals(link.getId()));
    }

    @Test void seedDoesNotOverrideAnExistingSkipWhenPairHasNoConversation() throws Exception {
        // Isolated in-memory fixture only; simulate a reviewer who already skipped.
        messages.deleteAll(); links.deleteAll(); decisions.deleteAll();
        var alex=members.findByUsername("demo_lin").orElseThrow();
        connections.decide("demo_zhou",alex.getId(),Decision.Choice.SKIP);
        fixtures.run();
        var jamie=members.findByUsername("demo_zhou").orElseThrow();
        assertThat(decisions.findByActorIdAndTargetId(jamie.getId(),alex.getId()).orElseThrow().getChoice()).isEqualTo(Decision.Choice.SKIP);
        assertThat(connections.forMember(jamie.getId())).noneMatch(c->c.other(jamie.getId()).equals(alex.getId()));
        assertThat(messages.count()).isEqualTo(4);
    }
}
