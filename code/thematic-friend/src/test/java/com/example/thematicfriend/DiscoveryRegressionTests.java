package com.example.thematicfriend;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.connection.*;
import com.example.thematicfriend.discovery.DiscoveryService;
import com.example.thematicfriend.safety.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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

/** A's new regression coverage. The original PrototypeFlowTests are retained separately. */
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:discovery-regression;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class DiscoveryRegressionTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired AccountService accounts;
    @Autowired DecisionRepository decisions;
    @Autowired ConnectionRepository links;
    @Autowired ConnectionService connections;
    @Autowired DiscoveryService discovery;
    @Autowired SafetyService safety;
    @Autowired BlockRepository blocks;
    Member jamie, alex, noah;

    @BeforeEach void fixtures() {
        blocks.deleteAll(); links.deleteAll(); decisions.deleteAll(); members.deleteAll();
        jamie = member("a_jamie", "Jamie", List.of("Coffee", "Reading"), "New friends");
        alex = member("a_alex", "Alex", List.of("Coffee", "Travel"), "New friends");
        noah = member("a_noah", "Noah", List.of("Music"), "Study buddy");
    }

    @Test @DisplayName("Planet reuses discovery filters and excludes hidden, skipped, matched and blocked people")
    void planetHonoursTheSameDiscoveryBoundaries() throws Exception {
        mvc.perform(get("/explore")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/explore").with(user(jamie.getUsername())).param("interest", "Coffee"))
                .andExpect(status().isOk()).andExpect(model().attribute("starCount",1))
                .andExpect(model().attribute("stars",hasSize(1)))
                .andExpect(content().string(containsString("star-profile-" + alex.getId())));
        var hidden = member("planet_hidden","Hidden",List.of("Coffee"),"New friends");
        var form = new ProfileForm(hidden); form.setDiscoverable(false); accounts.update(hidden.getUsername(),form);
        var incoming = member("planet_blocker","Blocked",List.of("Coffee"),"New friends");
        safety.block(incoming.getUsername(),jamie.getId());
        var skipped = member("planet_skipped","Skipped",List.of("Coffee"),"New friends");
        connections.decide(jamie.getUsername(),skipped.getId(),Decision.Choice.SKIP);
        matched();
        mvc.perform(get("/explore").with(user(jamie.getUsername())))
                .andExpect(status().isOk()).andExpect(model().attribute("starCount",1))
                .andExpect(model().attribute("connectionCount",1))
                .andExpect(content().string(containsString("star-profile-" + noah.getId())))
                .andExpect(content().string(not(containsString("star-profile-" + hidden.getId()))))
                .andExpect(content().string(not(containsString("star-profile-" + incoming.getId()))))
                .andExpect(content().string(not(containsString("star-profile-" + skipped.getId()))));
        mvc.perform(get("/explore").with(user(jamie.getUsername())).param("interest","<script>bad()</script>"))
                .andExpect(status().isOk()).andExpect(model().attribute("selectedInterest",""))
                .andExpect(content().string(not(containsString("<script>bad()"))));
    }

    private Member member(String username, String nickname, List<String> interests, String goal) {
        // Authentication is provided by MockMvc's user(); password behavior belongs to the baseline tests.
        var person = new Member(username, "unused-test-password-hash", nickname);
        person.updateProfile(nickname, "Fictional discovery fixture.", interests, goal, true);
        return members.saveAndFlush(person);
    }

    private Connection matched() {
        connections.decide(jamie.getUsername(), alex.getId(), Decision.Choice.LIKE);
        return connections.decide(alex.getUsername(), jamie.getId(), Decision.Choice.LIKE).orElseThrow();
    }

    @Test @DisplayName("A-01: combined filters, actual shared interests and available count")
    void filtersAndSummaryDescribeTheEligibleCandidate() throws Exception {
        var result = discovery.discover(jamie.getUsername(), "Coffee", "New friends");
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().member().getId()).isEqualTo(alex.getId());
        assertThat(result.getFirst().shared()).containsExactly("Coffee");
        mvc.perform(get("/discover").with(user(jamie.getUsername())).param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().isOk()).andExpect(model().attribute("remaining", 1))
                .andExpect(model().attribute("hasFilters", true))
                .andExpect(content().string(containsString("1 profile available")))
                .andExpect(content().string(containsString("Remove interest filter: Coffee")))
                .andExpect(content().string(containsString("Remove activity filter: New friends")));
    }

    @Test @DisplayName("A-01: unknown filter values are normalized and never become markup")
    void invalidFiltersDoNotCreatePhantomChipsOrMarkup() throws Exception {
        mvc.perform(get("/discover").with(user(jamie.getUsername())).param("interest", "<script>bad()</script>").param("goal", "Unknown"))
                .andExpect(status().isOk()).andExpect(model().attribute("selectedInterest", ""))
                .andExpect(model().attribute("selectedGoal", "")).andExpect(model().attribute("hasFilters", false))
                .andExpect(model().attribute("remaining", 2))
                .andExpect(content().string(not(containsString("<script>bad()"))))
                .andExpect(content().string(not(containsString("id=\"remove-interest-filter\""))));
    }

    @Test @DisplayName("A-02: revisiting counts exclude hidden, blocked and off-filter profiles")
    void revisitableSkipsRespectBothDirectionsOfBlockingAndFilters() {
        connections.decide(jamie.getUsername(), alex.getId(), Decision.Choice.SKIP);
        var hidden = member("a_hidden", "Hidden", List.of("Coffee"), "New friends");
        connections.decide(jamie.getUsername(), hidden.getId(), Decision.Choice.SKIP);
        var hiddenForm = new ProfileForm(hidden); hiddenForm.setDiscoverable(false); accounts.update(hidden.getUsername(), hiddenForm);
        var outgoing = member("a_outgoing", "Outgoing", List.of("Coffee"), "New friends");
        connections.decide(jamie.getUsername(), outgoing.getId(), Decision.Choice.SKIP); safety.block(jamie.getUsername(), outgoing.getId());
        var incoming = member("a_incoming", "Incoming", List.of("Coffee"), "New friends");
        connections.decide(jamie.getUsername(), incoming.getId(), Decision.Choice.SKIP); safety.block(incoming.getUsername(), jamie.getId());
        connections.decide(jamie.getUsername(), noah.getId(), Decision.Choice.SKIP);
        assertThat(discovery.discover(jamie.getUsername(), "Coffee", "New friends")).isEmpty();
        assertThat(discovery.revisitableSkips(jamie.getUsername(), "Coffee", "New friends")).isEqualTo(1);
        assertThat(discovery.revisitableSkips(jamie.getUsername(), "", "Study buddy")).isEqualTo(1);
        assertThat(discovery.revisitableSkips(jamie.getUsername(), "Sport", "New friends")).isZero();
        connections.resetSkips(jamie.getUsername());
        assertThat(discovery.discover(jamie.getUsername(), "Coffee", "New friends")).extracting(c -> c.member().getId()).containsExactly(alex.getId());
    }

    @Test @DisplayName("A-03: a one-sided like preserves filters and cannot create match feedback")
    void oneSidedLikeStaysInDiscovery() throws Exception {
        mvc.perform(post("/decisions/" + alex.getId()).with(user(jamie.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(redirectedUrl("/discover?interest=Coffee&goal=New%20friends"));
        assertThat(links.count()).isZero();
        mvc.perform(get("/matches/999999").with(user(jamie.getUsername()))).andExpect(status().isNotFound());
    }

    @Test @DisplayName("A-03: reciprocal and repeated decisions point to one real connection")
    void reciprocalAndRepeatedPostsUseTheSameMatch() throws Exception {
        connections.decide(jamie.getUsername(), alex.getId(), Decision.Choice.LIKE);
        mvc.perform(post("/decisions/" + jamie.getId()).with(user(alex.getUsername())).with(csrf())
                        .param("choice", "LIKE").param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().is3xxRedirection());
        var link = links.findAll().getFirst();
        for (int repeat = 0; repeat < 2; repeat++) {
            mvc.perform(post("/decisions/" + jamie.getId()).with(user(alex.getUsername())).with(csrf())
                            .param("choice", "LIKE").param("interest", "Coffee").param("goal", "New friends").param("next", "https://example.org"))
                    .andExpect(redirectedUrl("/matches/" + link.getId() + "?interest=Coffee&goal=New%20friends"));
        }
        assertThat(links.count()).isEqualTo(1);
    }

    @Test @DisplayName("A-05: match feedback uses the correct partner, shared interests and conversation")
    void matchFeedbackUsesTheParticipantConnection() throws Exception {
        var link = matched();
        mvc.perform(get("/matches/" + link.getId()).with(user(jamie.getUsername())).param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().isOk()).andExpect(view().name("match"))
                .andExpect(model().attribute("shared", List.of("Coffee")))
                .andExpect(model().attribute("selectedInterest", "Coffee"))
                .andExpect(content().string(containsString("Say hello to Alex")))
                .andExpect(content().string(containsString("href=\"/conversations/" + link.getId() + "\"")))
                .andExpect(content().string(containsString("id=\"keep-discovering\"")));
    }

    @Test @DisplayName("A-05: a match is private to its participants")
    void outsiderAndAnonymousRequestsCannotReadMatchFeedback() throws Exception {
        var link = matched();
        mvc.perform(get("/matches/" + link.getId()).with(user(noah.getUsername())))
                .andExpect(status().isNotFound()).andExpect(content().string(not(containsString("Say hello to Alex"))));
        mvc.perform(get("/matches/" + link.getId())).andExpect(status().is3xxRedirection());
    }

    @Test @DisplayName("A-05: blocking closes match feedback for both participants")
    void blockedOrEndedConnectionsCannotShowAnActiveMatch() throws Exception {
        var link = matched(); safety.block(jamie.getUsername(), alex.getId());
        for (var person : List.of(jamie, alex)) {
            mvc.perform(get("/matches/" + link.getId()).with(user(person.getUsername()))).andExpect(status().isForbidden());
        }
        safety.unblock(jamie.getUsername(), alex.getId());
        mvc.perform(get("/matches/" + link.getId()).with(user(jamie.getUsername()))).andExpect(status().isForbidden());
    }

    @Test @DisplayName("A-05: no shared interest is invented and user text is escaped")
    void changedProfilesUseHonestEmptySharedState() throws Exception {
        var link = matched();
        var form = new ProfileForm(alex); form.setNickname("<b>Alex</b>"); form.setInterests(List.of("Music")); accounts.update(alex.getUsername(), form);
        mvc.perform(get("/matches/" + link.getId()).with(user(jamie.getUsername())))
                .andExpect(status().isOk()).andExpect(model().attribute("shared", List.of()))
                .andExpect(content().string(containsString("Different interests can start a new conversation")))
                .andExpect(content().string(containsString("&lt;b&gt;Alex&lt;/b&gt;")))
                .andExpect(content().string(not(containsString("<b>Alex</b>"))))
                .andExpect(content().string(not(containsString("id=\"match-shared\""))));
    }

    @Test @DisplayName("A-05: empty results only offer revisiting when it can restore a candidate")
    void emptyRecoveryActionsReflectEligibleSkippedProfiles() throws Exception {
        mvc.perform(get("/discover").with(user(jamie.getUsername())).param("interest", "Sport").param("goal", "Study buddy"))
                .andExpect(status().isOk()).andExpect(model().attribute("revisitableSkips", 0))
                .andExpect(content().string(containsString("No profiles match these filters.")))
                .andExpect(content().string(containsString("id=\"empty-clear-filters\"")))
                .andExpect(content().string(not(containsString("id=\"revisit-form\""))));
        connections.decide(jamie.getUsername(), alex.getId(), Decision.Choice.SKIP);
        mvc.perform(get("/discover").with(user(jamie.getUsername())).param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().isOk()).andExpect(model().attribute("revisitableSkips", 1))
                .andExpect(content().string(containsString("Revisit skipped profiles (1)")));
    }

    @Test @DisplayName("A-05: revisit preserves filters and never clears a like")
    void resetKeepsTheSelectedFiltersAndOtherDecisions() throws Exception {
        connections.decide(jamie.getUsername(), alex.getId(), Decision.Choice.SKIP);
        connections.decide(jamie.getUsername(), noah.getId(), Decision.Choice.LIKE);
        mvc.perform(post("/decisions/reset").with(user(jamie.getUsername())).with(csrf())
                        .param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(redirectedUrl("/discover?interest=Coffee&goal=New%20friends"));
        assertThat(decisions.findByActorIdAndTargetId(jamie.getId(), noah.getId()).orElseThrow().getChoice()).isEqualTo(Decision.Choice.LIKE);
        assertThat(discovery.discover(jamie.getUsername(), "Coffee", "New friends")).extracting(c -> c.member().getId()).containsExactly(alex.getId());
    }

    @Test @DisplayName("A-06: temporary Chinese feedback keeps the same connection and filters")
    void chineseMatchFeedbackPreservesTheAction() throws Exception {
        var link = matched();
        mvc.perform(get("/matches/" + link.getId()).with(user(jamie.getUsername())).param("lang", "zh")
                        .param("interest", "Coffee").param("goal", "New friends"))
                .andExpect(status().isOk()).andExpect(content().string(containsString("你们互相喜欢")))
                .andExpect(content().string(containsString("向 Alex 打个招呼")))
                .andExpect(content().string(containsString("href=\"/conversations/" + link.getId() + "\"")))
                .andExpect(model().attribute("selectedInterest", "Coffee"));
    }
}
