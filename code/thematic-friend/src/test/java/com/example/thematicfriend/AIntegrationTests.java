package com.example.thematicfriend;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.chat.MessageRepository;
import com.example.thematicfriend.connection.*;
import com.example.thematicfriend.safety.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** A's shared-route regression gate. B–F's unimplemented features are not certified here. */
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:a-integration;DB_CLOSE_DELAY=-1", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class AIntegrationTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired AccountService accounts;
    @Autowired DecisionRepository decisions;
    @Autowired ConnectionRepository links;
    @Autowired MessageRepository messages;
    @Autowired BlockRepository blocks;
    @Autowired ReportRepository reports;
    @Autowired SafetyService safety;
    Member jamie, alex, outsider;

    @BeforeEach void fixtures() {
        messages.deleteAll(); reports.deleteAll(); blocks.deleteAll(); links.deleteAll(); decisions.deleteAll(); members.deleteAll();
        jamie = member("integration_jamie", "Jamie");
        alex = member("integration_alex", "Alex");
        outsider = member("integration_outsider", "Outside");
    }

    private Member member(String username, String nickname) {
        var member = new Member(username, "unused-mockmvc-fixture", nickname);
        member.updateProfile(nickname, "Fictional integration fixture.", List.of("Coffee"), "New friends", true);
        return members.saveAndFlush(member);
    }

    private Connection matchThroughHttp() throws Exception {
        mvc.perform(post("/decisions/" + alex.getId()).with(user(jamie.getUsername())).with(csrf()).param("choice", "LIKE"))
                .andExpect(redirectedUrl("/discover?interest=&goal="));
        assertThat(links.count()).isZero();
        mvc.perform(post("/decisions/" + jamie.getId()).with(user(alex.getUsername())).with(csrf()).param("choice", "LIKE"))
                .andExpect(status().is3xxRedirection());
        var link = links.findAll().getFirst();
        mvc.perform(get("/matches/" + link.getId()).with(user(jamie.getUsername())))
                .andExpect(status().isOk()).andExpect(content().string(containsString("href=\"/conversations/" + link.getId() + "\"")));
        return link;
    }

    @Test @DisplayName("A-INT-01: stale hidden profile keeps filters without saving a decision")
    void hiddenCardHasAUsableFilteredRecovery() throws Exception {
        var form = new ProfileForm(alex); form.setDiscoverable(false); accounts.update(alex.getUsername(), form);
        mvc.perform(post("/decisions/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().isNotFound()).andExpect(view().name("error"))
                .andExpect(content().string(containsString("href=\"/discover?interest=Coffee&amp;goal=New%20friends\"")))
                .andExpect(content().string(containsString("Your filters are kept when you return to Discover.")));
        assertThat(decisions.count()).isZero();
        assertThat(links.count()).isZero();
    }

    @ParameterizedTest @ValueSource(booleans={false, true})
    @DisplayName("A-INT-02: either block direction rejects an old card without disclosing the blocker")
    void blockedStaleCardKeepsTheSamePrivateError(boolean incoming) throws Exception {
        safety.block(incoming ? alex.getUsername() : jamie.getUsername(), incoming ? jamie.getId() : alex.getId());
        mvc.perform(post("/decisions/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("This person is not available to connect")))
                .andExpect(content().string(not(containsString("blocked you"))));
        assertThat(decisions.count()).isZero();
        assertThat(links.count()).isZero();
    }

    @Test @DisplayName("A-INT-03: invalid recovery parameters cannot become an external destination or markup")
    void recoveryOnlyAcceptsKnownFilters() throws Exception {
        mvc.perform(post("/decisions/99999999").with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "<script>stolen()</script>")
                        .param("goal", "https://example.invalid").param("next", "https://example.invalid"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(containsString("id=\"recovery-discover\"")))
                .andExpect(content().string(containsString("href=\"/discover\"")))
                .andExpect(content().string(not(containsString("<script>stolen()"))))
                .andExpect(content().string(not(containsString("href=\"https://example.invalid"))))
                .andExpect(content().string(not(containsString("id=\"recovery-filters\""))));
        assertThat(decisions.count()).isZero();
    }

    @Test @DisplayName("A-INT-04: mutual choice, message, end and stale decision share one closed connection")
    void completeMatchChatEndFlowEnforcesTheBoundary() throws Exception {
        var link = matchThroughHttp();
        mvc.perform(post("/conversations/" + link.getId() + "/messages").with(user(jamie.getUsername())).with(csrf())
                        .param("body", "A real HTTP integration message."))
                .andExpect(redirectedUrl("/conversations/" + link.getId()));
        mvc.perform(get("/api/conversations/" + link.getId() + "/messages").with(user(alex.getUsername())))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].body").value("A real HTTP integration message."))
                .andExpect(jsonPath("$[0].mine").value(false));
        mvc.perform(get("/api/conversations/" + link.getId() + "/messages").with(user(outsider.getUsername())))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.error").exists());
        mvc.perform(post("/connections/" + link.getId() + "/end").with(user(alex.getUsername())).with(csrf()))
                .andExpect(redirectedUrl("/connections"));
        for (var person : List.of(jamie, alex)) {
            mvc.perform(get("/matches/" + link.getId()).with(user(person.getUsername()))).andExpect(status().isForbidden());
            mvc.perform(get("/conversations/" + link.getId()).with(user(person.getUsername()))).andExpect(status().isForbidden());
            mvc.perform(get("/api/conversations/" + link.getId() + "/messages").with(user(person.getUsername())))
                    .andExpect(status().isForbidden()).andExpect(jsonPath("$.error").exists());
            mvc.perform(post("/conversations/" + link.getId() + "/messages").with(user(person.getUsername())).with(csrf()).param("body", "Must not save"))
                    .andExpect(status().isForbidden());
        }
        mvc.perform(post("/decisions/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee"))
                .andExpect(status().isConflict()).andExpect(model().attribute("recoveryInterest", "Coffee"));
        assertThat(links.count()).isEqualTo(1);
        assertThat(messages.count()).isEqualTo(1);
    }

    @Test @DisplayName("A-INT-05: block, private report and unblock never reopen a conversation")
    void blockReportAndUnblockRemainConsistentAcrossRoutes() throws Exception {
        var link = matchThroughHttp();
        mvc.perform(post("/blocks/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())).andExpect(redirectedUrl("/safety"));
        mvc.perform(post("/reports/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())
                        .param("reason", "Other concern").param("details", "Private fixture receipt A-INT-05"))
                .andExpect(redirectedUrl("/safety"));
        mvc.perform(get("/safety").with(user(jamie.getUsername())))
                .andExpect(content().string(containsString("Private fixture receipt A-INT-05")));
        for (var person : List.of(alex, outsider)) {
            mvc.perform(get("/safety").with(user(person.getUsername())))
                    .andExpect(content().string(not(containsString("Private fixture receipt A-INT-05"))));
        }
        mvc.perform(post("/blocks/" + alex.getId() + "/remove").with(user(jamie.getUsername())).with(csrf())).andExpect(redirectedUrl("/safety"));
        assertThat(blocks.count()).isZero();
        assertThat(reports.count()).isEqualTo(1);
        for (var person : List.of(jamie, alex)) {
            mvc.perform(get("/api/conversations/" + link.getId() + "/messages").with(user(person.getUsername())))
                    .andExpect(status().isForbidden());
        }
        assertThat(links.findById(link.getId()).orElseThrow().isActive()).isFalse();
    }

    @Test @DisplayName("A-INT-06: missing CSRF cannot mutate any shared contact route")
    void csrfFailureLeavesContactStateUntouched() throws Exception {
        var link = matchThroughHttp();
        mvc.perform(post("/decisions/" + outsider.getId()).with(user(jamie.getUsername())).param("choice", "SKIP")).andExpect(status().isForbidden());
        mvc.perform(post("/decisions/reset").with(user(jamie.getUsername()))).andExpect(status().isForbidden());
        mvc.perform(post("/conversations/" + link.getId() + "/messages").with(user(jamie.getUsername())).param("body", "Must not save")).andExpect(status().isForbidden());
        mvc.perform(post("/connections/" + link.getId() + "/end").with(user(jamie.getUsername()))).andExpect(status().isForbidden());
        mvc.perform(post("/blocks/" + alex.getId()).with(user(jamie.getUsername()))).andExpect(status().isForbidden());
        mvc.perform(post("/reports/" + alex.getId()).with(user(jamie.getUsername())).param("reason", "Other concern")).andExpect(status().isForbidden());
        assertThat(links.findById(link.getId()).orElseThrow().isActive()).isTrue();
        assertThat(decisions.count()).isEqualTo(2);
        assertThat(messages.count()).isZero(); assertThat(blocks.count()).isZero(); assertThat(reports.count()).isZero();
    }

    @Test @DisplayName("A-INT-07: recovery feedback follows the temporary interface locale")
    void chineseRecoveryKeepsTheValidatedFilter() throws Exception {
        mvc.perform(post("/decisions/99999999").with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee").param("lang", "zh"))
                .andExpect(status().isNotFound()).andExpect(model().attribute("recoveryInterest", "Coffee"))
                .andExpect(content().string(containsString("返回发现页时会保留你的筛选条件。")));
    }
}
