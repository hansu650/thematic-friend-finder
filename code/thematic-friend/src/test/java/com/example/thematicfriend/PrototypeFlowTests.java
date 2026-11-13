package com.example.thematicfriend;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.connection.*;
import com.example.thematicfriend.chat.*;
import com.example.thematicfriend.discovery.*;
import com.example.thematicfriend.safety.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:flow-test;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class PrototypeFlowTests {
    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired AccountService accounts;
    @Autowired PasswordEncoder encoder;
    @Autowired DecisionRepository decisions;
    @Autowired ConnectionRepository connectionRepo;
    @Autowired ConnectionService connections;
    @Autowired ChatService chat;
    @Autowired MessageRepository messages;
    @Autowired DiscoveryService discovery;
    @Autowired SafetyService safety;
    @Autowired BlockRepository blocks;
    @Autowired ReportRepository reports;
    Member p,q,r;

    @BeforeEach void setup() {
        messages.deleteAll(); reports.deleteAll(); blocks.deleteAll(); connectionRepo.deleteAll(); decisions.deleteAll(); members.deleteAll();
        p=create("person_p","小周",List.of("Coffee","Reading"));
        q=create("person_q","林予安",List.of("Coffee","Photography"));
        r=create("person_r","第三人",List.of("Sport"));
    }
    Member create(String name,String nick,List<String> interests) {
        Member member=new Member(name,encoder.encode("Synthetic-Test-2026"),nick);
        member.updateProfile(nick,"虚构测试资料",interests,"New friends",true);
        return members.saveAndFlush(member);
    }
    Connection match() {
        connections.decide(p.getUsername(),q.getId(),Decision.Choice.LIKE);
        return connections.decide(q.getUsername(),p.getId(),Decision.Choice.LIKE).orElseThrow();
    }
    @Test void publicPagesRenderAndProtectedPagesRequireLogin() throws Exception {
        for(String route:List.of("/","/login","/signup","/privacy")) mvc.perform(get(route)).andExpect(status().isOk());
        mvc.perform(get("/discover")).andExpect(status().is3xxRedirection());
        mvc.perform(get("/api/conversations/1/messages")).andExpect(status().isUnauthorized());
    }
    @Test void reportReviewRequiresStaffForListDetailAndUpdate() throws Exception {
        var report = reports.saveAndFlush(new Report(p.getId(), q.getId(), "Spam", "Synthetic report"));
        String detail = "/staff/reports/" + report.getId();
        for (String path : List.of("/staff/reports", detail)) {
            mvc.perform(get(path)).andExpect(redirectedUrl("/login"));
            mvc.perform(get(path).with(user(p.getUsername()))).andExpect(status().isForbidden());
        }
        mvc.perform(post(detail).with(user(p.getUsername())).with(csrf()).param("status", "REVIEWED"))
                .andExpect(status().isForbidden());
        assertThat(reports.findById(report.getId()).orElseThrow().getReviewStatus())
                .isEqualTo(Report.ReviewStatus.PENDING);
    }

    @Test void staffCanResolveOnceAndInternalNotesStayPrivate() throws Exception {
        var report = reports.saveAndFlush(new Report(p.getId(), q.getId(), "Spam", "Synthetic report"));
        String detail = "/staff/reports/" + report.getId();
        var staff = user(r.getUsername()).roles("USER", "STAFF");
        mvc.perform(get("/staff/reports").with(staff)).andExpect(status().isOk());
        mvc.perform(get(detail).with(staff)).andExpect(status().isOk());
        mvc.perform(post(detail).with(staff).param("status", "REVIEWED")).andExpect(status().isForbidden());
        mvc.perform(post(detail).with(staff).with(csrf()).param("status", "PENDING"))
                .andExpect(status().isBadRequest());
        mvc.perform(post(detail).with(staff).with(csrf()).param("status", "REVIEWED").param("note", "Synthetic private note"))
                .andExpect(redirectedUrl(detail));
        var saved = reports.findById(report.getId()).orElseThrow();
        assertThat(saved.getReviewStatus()).isEqualTo(Report.ReviewStatus.REVIEWED);
        assertThat(saved.getHandlerId()).isEqualTo(r.getId());
        assertThat(saved.getHandledAt()).isNotNull();
        assertThat(saved.getInternalNote()).isEqualTo("Synthetic private note");
        mvc.perform(post(detail).with(staff).with(csrf()).param("status", "DISMISSED"))
                .andExpect(status().isConflict());
        mvc.perform(get("/safety").with(user(p.getUsername())))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Synthetic private note"))));
        mvc.perform(get("/safety").with(user(q.getUsername())))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Synthetic report"))));
    }
    @Test void signupHashesPasswordAndRejectsDuplicateAndUnderage() throws Exception {
        mvc.perform(post("/signup").with(csrf()).param("username","NEW_USER").param("nickname","新用户").param("password","Synthetic-New-2026").param("adult","true"))
                .andExpect(redirectedUrl("/login?registered"));
        Member registered=members.findByUsername("new_user").orElseThrow();
        assertThat(registered.getPasswordHash()).isNotEqualTo("Synthetic-New-2026");
        assertThat(encoder.matches("Synthetic-New-2026",registered.getPasswordHash())).isTrue();
        long count=members.count();
        mvc.perform(post("/signup").with(csrf()).param("username","new_user").param("nickname","重复").param("password","Synthetic-New-2026").param("adult","true"))
                .andExpect(model().attributeHasFieldErrors("signupForm","username"));
        mvc.perform(post("/signup").with(csrf()).param("username","minor_user").param("nickname","未确认").param("password","Synthetic-New-2026"))
                .andExpect(model().attributeHasFieldErrors("signupForm","adult"));
        assertThat(members.count()).isEqualTo(count);
    }
    @Test void csrfRequiredAndGetCannotMutateDecisions() throws Exception {
        mvc.perform(post("/decisions/"+q.getId()).with(user(p.getUsername())).param("choice","LIKE")).andExpect(status().isForbidden());
        mvc.perform(get("/decisions/"+q.getId()).with(user(p.getUsername()))).andExpect(status().isMethodNotAllowed());
        assertThat(decisions.count()).isZero();
    }
    @Test void profileValidationAndOwnership() throws Exception {
        mvc.perform(post("/profile").with(user(p.getUsername())).with(csrf()).param("id",q.getId().toString()).param("nickname","新的小周").param("bio","简介").param("interests","Reading").param("goal","Study buddy").param("discoverable","true"))
                .andExpect(redirectedUrl("/profile"));
        assertThat(accounts.member(p.getId()).getNickname()).isEqualTo("新的小周");
        assertThat(accounts.member(q.getId()).getNickname()).isEqualTo("林予安");
        mvc.perform(post("/profile").with(user(p.getUsername())).with(csrf()).param("nickname"," ").param("goal","不存在").param("interests","非法标签"))
                .andExpect(model().attributeHasFieldErrors("profileForm","nickname","goal","interests"));
    }
    @Test void discoveryUsesRealIntersectionAndExcludesHiddenAndBlocked() {
        var result=discovery.discover(p.getUsername(),"Coffee","");
        assertThat(result).hasSize(1); assertThat(result.getFirst().shared()).containsExactly("Coffee");
        ProfileForm hidden=new ProfileForm(q); hidden.setDiscoverable(false); accounts.update(q.getUsername(),hidden);
        assertThat(discovery.discover(p.getUsername(),"Coffee","")).isEmpty();
        hidden.setDiscoverable(true); accounts.update(q.getUsername(),hidden);
        safety.block(q.getUsername(),p.getId());
        assertThat(discovery.discover(p.getUsername(),"Coffee","")).isEmpty();
        assertThatThrownBy(()->connections.decide(p.getUsername(),q.getId(),Decision.Choice.LIKE)).isInstanceOf(ResponseStatusException.class);
    }
    @Test void oneSidedLikeCannotChatAndMutualMatchIsUnique() {
        assertThat(connections.decide(p.getUsername(),q.getId(),Decision.Choice.LIKE)).isEmpty();
        assertThat(connectionRepo.count()).isZero();
        Connection first=connections.decide(q.getUsername(),p.getId(),Decision.Choice.LIKE).orElseThrow();
        assertThat(connections.decide(p.getUsername(),q.getId(),Decision.Choice.LIKE).orElseThrow().getId()).isEqualTo(first.getId());
        assertThat(connectionRepo.count()).isEqualTo(1);
    }
    @Test void concurrentReciprocalLikesProduceOneConnection() throws Exception {
        try(var executor=Executors.newFixedThreadPool(2)) {
            CountDownLatch start=new CountDownLatch(1);
            var first=executor.submit(()->{start.await(); return connections.decide(p.getUsername(),q.getId(),Decision.Choice.LIKE);});
            var second=executor.submit(()->{start.await(); return connections.decide(q.getUsername(),p.getId(),Decision.Choice.LIKE);});
            start.countDown(); first.get(15,TimeUnit.SECONDS); second.get(15,TimeUnit.SECONDS);
        }
        assertThat(connectionRepo.count()).isEqualTo(1);
    }
    @Test void messagesPersistAndOutsiderCannotReadOrSend() throws Exception {
        Connection link=match();
        chat.send(p.getUsername(),link.getId(),"你好，从咖啡聊起。");
        assertThat(chat.read(q.getUsername(),link.getId(),0L)).extracting(ChatService.MessageView::body).containsExactly("你好，从咖啡聊起。");
        mvc.perform(get("/api/conversations/"+link.getId()+"/messages").with(user(r.getUsername()))).andExpect(status().isNotFound());
        mvc.perform(post("/conversations/"+link.getId()+"/messages").with(user(r.getUsername())).with(csrf()).param("body","冒充发送"))
                .andExpect(status().isNotFound());
        assertThat(messages.count()).isEqualTo(1);
    }
    @Test void messageValidationAndTemplateEscaping() throws Exception {
        Connection link=match();
        assertThatThrownBy(()->chat.send(p.getUsername(),link.getId(),"   ")).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->chat.send(p.getUsername(),link.getId(),"x".repeat(1001))).isInstanceOf(ResponseStatusException.class);
        chat.send(p.getUsername(),link.getId(),"<script>alert('x')</script>");
        String html=mvc.perform(get("/conversations/"+link.getId()).with(user(q.getUsername()))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(html).contains("&lt;script&gt;").doesNotContain("<script>alert");
    }
    @Test void blockingEndsContactAndUnblockingDoesNotRestoreIt() {
        Connection link=match();
        chat.send(p.getUsername(),link.getId(),"此前消息");
        safety.block(q.getUsername(),p.getId());
        assertThatThrownBy(()->chat.read(p.getUsername(),link.getId(),0L)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(()->chat.send(p.getUsername(),link.getId(),"屏蔽之后")).isInstanceOf(ResponseStatusException.class);
        safety.unblock(q.getUsername(),p.getId());
        assertThatThrownBy(()->chat.read(p.getUsername(),link.getId(),0L)).isInstanceOf(ResponseStatusException.class);
        assertThat(messages.count()).isEqualTo(1);
    }
    @Test void endingContactDeniesBothParticipants() {
        Connection link=match(); connections.end(p.getUsername(),link.getId());
        assertThatThrownBy(()->chat.send(q.getUsername(),link.getId(),"结束之后")).isInstanceOf(ResponseStatusException.class);
        assertThat(connections.forMember(p.getId())).isEmpty();
    }
    @Test void reportsArePrivateAndStillPossibleAfterBlocking() throws Exception {
        match(); safety.block(p.getUsername(),q.getId());
        safety.report(p.getUsername(),q.getId(),SafetyService.REASONS.getFirst(),"仅举报者能看见的测试说明");
        assertThat(safety.reports(p.getUsername())).hasSize(1);
        assertThat(safety.reports(q.getUsername())).isEmpty();
        mvc.perform(get("/safety").with(user(q.getUsername()))).andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("仅举报者能看见"))));
    }
    @Test void skipsCanBeResetAndPostPreservesWhitelistedFilters() throws Exception {
        mvc.perform(post("/decisions/"+q.getId()).with(user(p.getUsername())).with(csrf()).param("choice","SKIP").param("interest","Coffee").param("goal","New friends").param("next","https://example.org"))
                .andExpect(status().is3xxRedirection()).andExpect(header().string("Location",org.hamcrest.Matchers.startsWith("/discover?interest=")));
        assertThat(discovery.discover(p.getUsername(),"Coffee","")).isEmpty();
        connections.resetSkips(p.getUsername()); assertThat(discovery.discover(p.getUsername(),"Coffee","")).hasSize(1);
    }
    @Test void allAuthenticatedPagesRender() throws Exception {
        for(String route:List.of("/discover","/profile","/connections","/safety","/reports/"+q.getId())) {
            mvc.perform(get(route).with(user(p.getUsername()))).andExpect(status().isOk());
        }
    }
}
