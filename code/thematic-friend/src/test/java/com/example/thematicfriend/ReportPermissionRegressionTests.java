package com.example.thematicfriend;

import com.example.thematicfriend.account.Member;
import com.example.thematicfriend.account.MemberRepository;
import com.example.thematicfriend.safety.Report;
import com.example.thematicfriend.safety.ReportRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:report-permission;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.review.staff-member-id=1"
})
@ActiveProfiles("report-permission-test")
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ReportPermissionRegressionTests {
    private static final String QUEUE = "/staff/reports";
    private static final String PASSWORD = "Fictional-Review-2026";
    private static final String REPORT_REASON = "Other concern";
    private static final String REPORT_DETAILS = "Fictional report details for the receipt";
    private static final String INTERNAL_NOTE = "Fictional staff-only note";
    private static final String RECORDED_RECEIPT = "<span class=\"status-pill\">\\s*Recorded\\s*</span>";

    @Autowired MockMvc mvc;
    @Autowired MemberRepository members;
    @Autowired ReportRepository reports;
    @Autowired PasswordEncoder encoder;

    private Member staff;
    private Member reporter;
    private Member reported;
    private Member unrelated;

    @BeforeAll
    void createFictionalAccounts() {
        String hash = encoder.encode(PASSWORD);
        // The configured ID belongs to the first account created in this isolated H2 database.
        staff = members.saveAndFlush(new Member("review_staff", hash, "Review staff"));
        assertThat(staff.getId()).isEqualTo(1L);
        reporter = members.saveAndFlush(new Member("review_reporter", hash, "Reporter"));
        reported = members.saveAndFlush(new Member("review_reported", hash, "Reported member"));
        unrelated = members.saveAndFlush(new Member("review_unrelated", hash, "Other member"));
    }

    @BeforeEach
    void clearReports() {
        reports.deleteAll();
    }

    @Test
    void formLoginGatesStaffActionsAndRestrictsReceiptContents() throws Exception {
        Report report = pendingReport();
        String detail = reviewPath(report);
        MockHttpSession staffSession = login(staff);
        MockHttpSession reporterSession = login(reporter);
        MockHttpSession reportedSession = login(reported);
        MockHttpSession unrelatedSession = login(unrelated);

        for (String url : List.of(QUEUE, detail, "/safety")) {
            mvc.perform(get(url)).andExpect(redirectedUrl("/login"));
        }
        mvc.perform(post(detail).with(csrf()).param("status", "REVIEWED"))
                .andExpect(redirectedUrl("/login"));
        mvc.perform(post(detail).param("status", "REVIEWED")).andExpect(status().isForbidden());
        assertPendingUnchanged(report);

        for (MockHttpSession session : List.of(reporterSession, reportedSession, unrelatedSession)) {
            mvc.perform(get(QUEUE).session(session)).andExpect(status().isForbidden());
            mvc.perform(get(detail).session(session)).andExpect(status().isForbidden());
            mvc.perform(post(detail).session(session).with(csrf()).param("status", "REVIEWED"))
                    .andExpect(status().isForbidden());
            mvc.perform(post(detail).session(session).param("status", "REVIEWED"))
                    .andExpect(status().isForbidden());
            assertPendingUnchanged(report);
        }

        mvc.perform(get(QUEUE).session(staffSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString("href=\"" + detail + "\"")))
                .andExpect(content().string(not(containsString(REPORT_DETAILS))));
        mvc.perform(get(detail).session(staffSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString(REPORT_DETAILS)));
        String pendingReceipt = mvc.perform(get("/safety").session(reporterSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString(REPORT_DETAILS)))
                .andReturn().getResponse().getContentAsString();
        mvc.perform(post(detail).session(staffSession).with(csrf())
                        .param("status", "REVIEWED").param("note", INTERNAL_NOTE))
                .andExpect(redirectedUrl(detail));
        mvc.perform(get(detail).session(staffSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString(INTERNAL_NOTE)));
        mvc.perform(get(QUEUE).session(staffSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString("REVIEWED")))
                .andExpect(content().string(not(containsString(INTERNAL_NOTE))));

        String resolvedReceipt = mvc.perform(get("/safety").session(reporterSession)).andExpect(status().isOk())
                .andExpect(content().string(containsString(REPORT_DETAILS)))
                .andExpect(content().string(not(containsString(INTERNAL_NOTE))))
                .andReturn().getResponse().getContentAsString();
        assertThat(resolvedReceipt).containsPattern(RECORDED_RECEIPT);
        assertThat(pendingReceipt).containsPattern(RECORDED_RECEIPT);
        for (MockHttpSession session : List.of(reportedSession, unrelatedSession, staffSession)) {
            mvc.perform(get("/safety").session(session)).andExpect(status().isOk())
                    .andExpect(content().string(not(containsString(REPORT_DETAILS))))
                    .andExpect(content().string(not(containsString(INTERNAL_NOTE))));
        }
    }

    @Test
    void rejectedReviewRequestsLeaveThePendingReportUnchanged() throws Exception {
        Report report = pendingReport();
        String detail = reviewPath(report);
        MockHttpSession session = login(staff);

        mvc.perform(post(detail).session(session).param("status", "REVIEWED").param("note", INTERNAL_NOTE))
                .andExpect(status().isForbidden());
        assertPendingUnchanged(report);

        for (String invalidStatus : List.of("PENDING", "UNKNOWN")) {
            mvc.perform(post(detail).session(session).with(csrf())
                            .param("status", invalidStatus).param("note", INTERNAL_NOTE))
                    .andExpect(status().isBadRequest());
            assertPendingUnchanged(report);
        }
        mvc.perform(post(detail).session(session).with(csrf())
                        .param("status", "DISMISSED").param("note", "x".repeat(1001)))
                .andExpect(status().isBadRequest());
        assertPendingUnchanged(report);

        String unknown = QUEUE + "/" + (report.getId() + 1);
        mvc.perform(get(unknown).session(session)).andExpect(status().isNotFound());
        mvc.perform(post(unknown).session(session).with(csrf()).param("status", "REVIEWED"))
                .andExpect(status().isNotFound());
        assertPendingUnchanged(report);
    }

    @Test
    void reportSubmissionRejectsInvalidInputWithoutCreatingReceipts() throws Exception {
        MockHttpSession session = login(reporter);
        String form = "/reports/" + reported.getId();
        mvc.perform(post(form).session(session).with(csrf()).param("reason", "Unlisted reason"))
                .andExpect(status().isBadRequest());
        assertThat(reports.count()).isZero();
        mvc.perform(post(form).session(session).with(csrf())
                        .param("reason", REPORT_REASON).param("details", "x".repeat(1001)))
                .andExpect(status().isBadRequest());
        assertThat(reports.count()).isZero();
        mvc.perform(post("/reports/" + (unrelated.getId() + 1)).session(session).with(csrf())
                        .param("reason", REPORT_REASON))
                .andExpect(status().isNotFound());
        assertThat(reports.count()).isZero();
    }

    @Test
    void concurrentResolutionRecordsOnlyTheWinningDecision() throws Exception {
        Report report = pendingReport();
        String path = reviewPath(report);
        MockHttpSession firstSession = login(staff);
        MockHttpSession secondSession = login(staff);
        var ready = new CyclicBarrier(2);
        int reviewed;
        int dismissed;
        try (var workers = Executors.newFixedThreadPool(2)) {
            var first = workers.submit(() -> {
                ready.await(5, TimeUnit.SECONDS);
                return resolve(path, firstSession, Report.ReviewStatus.REVIEWED, "Reviewed in first session");
            });
            var second = workers.submit(() -> {
                ready.await(5, TimeUnit.SECONDS);
                return resolve(path, secondSession, Report.ReviewStatus.DISMISSED, "Dismissed in second session");
            });
            reviewed = first.get(15, TimeUnit.SECONDS);
            dismissed = second.get(15, TimeUnit.SECONDS);
        }

        assertThat(List.of(reviewed, dismissed))
                .containsExactlyInAnyOrder(HttpStatus.FOUND.value(), HttpStatus.CONFLICT.value());
        boolean firstWon = reviewed == HttpStatus.FOUND.value();
        Report persisted = reports.findById(report.getId()).orElseThrow();
        assertThat(persisted.getReviewStatus())
                .isEqualTo(firstWon ? Report.ReviewStatus.REVIEWED : Report.ReviewStatus.DISMISSED);
        assertThat(persisted.getInternalNote())
                .isEqualTo(firstWon ? "Reviewed in first session" : "Dismissed in second session");
        assertThat(persisted.getHandlerId()).isEqualTo(staff.getId());
        assertThat(persisted.getHandledAt()).isBetween(report.getCreatedAt(), Instant.now().plusMillis(1));
        assertThat(reports.count()).isEqualTo(1);

        mvc.perform(post(path).session(firstSession).with(csrf()).param("status", "DISMISSED")
                        .param("note", "Repeated request"))
                .andExpect(status().isConflict());
        assertThat(reports.findById(report.getId()).orElseThrow())
                .usingRecursiveComparison().isEqualTo(persisted);
    }

    private MockHttpSession login(Member member) throws Exception {
        return (MockHttpSession) mvc.perform(post("/login").with(csrf())
                        .param("username", member.getUsername()).param("password", PASSWORD))
                .andExpect(redirectedUrl("/explore")).andReturn().getRequest().getSession(false);
    }

    private Report pendingReport() {
        Report report = reports.saveAndFlush(new Report(reporter.getId(), reported.getId(), REPORT_REASON, REPORT_DETAILS));
        return reports.findById(report.getId()).orElseThrow();
    }

    private String reviewPath(Report report) {
        return QUEUE + "/" + report.getId();
    }

    private void assertPendingUnchanged(Report report) {
        assertThat(reports.count()).isEqualTo(1);
        assertThat(reports.findById(report.getId()).orElseThrow())
                .usingRecursiveComparison().isEqualTo(report);
    }

    private int resolve(String path, MockHttpSession session, Report.ReviewStatus status, String note)
            throws Exception {
        return mvc.perform(post(path).session(session).with(csrf()).param("status", status.name()).param("note", note))
                .andReturn().getResponse().getStatus();
    }
}
