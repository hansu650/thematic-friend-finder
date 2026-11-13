package com.example.thematicfriend.safety;

import com.example.thematicfriend.account.MemberRepository;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Controller
@RequestMapping("/staff/reports")
public class ReportReviewController {
    private final ReportRepository reports;
    private final MemberRepository members;

    public ReportReviewController(ReportRepository reports, MemberRepository members) {
        this.reports = reports;
        this.members = members;
    }

    @GetMapping
    public String queue(Model model) {
        model.addAttribute("reports", reports.findAllByOrderByCreatedAtDesc());
        return "report-review";
    }

    @GetMapping("/{id}")
    public String detail(@PathVariable Long id, Model model) {
        model.addAttribute("report", reports.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
        return "report-review";
    }

    @PostMapping("/{id}")
    @Transactional
    public String resolve(@PathVariable Long id, @RequestParam Report.ReviewStatus status,
            @RequestParam(defaultValue = "") String note, Principal principal) {
        if (status == Report.ReviewStatus.PENDING || note.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        var handler = members.findByUsername(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN));
        var report = reports.findForReview(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (report.getReviewStatus() != Report.ReviewStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT);
        }
        report.resolve(status, handler.getId(), note.strip());
        return "redirect:/staff/reports/" + id;
    }
}
