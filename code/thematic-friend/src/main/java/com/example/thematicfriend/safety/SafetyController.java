package com.example.thematicfriend.safety;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.security.Principal;

@Controller
public class SafetyController {
    private final SafetyService safety;
    public SafetyController(SafetyService safety) { this.safety=safety; }
    @GetMapping("/safety")
    public String safety(Principal principal,Model model) {
        model.addAttribute("blockedMembers",safety.blocked(principal.getName()));
        model.addAttribute("reports",safety.reports(principal.getName()));
        model.addAttribute("activePage","safety"); return "safety";
    }
    @PostMapping("/blocks/{target}")
    public String block(Principal principal,@PathVariable Long target,RedirectAttributes redirect) {
        safety.block(principal.getName(),target);
        redirect.addFlashAttribute("notice","ui.person_blocked_they_can_no_longer_connect_with_you"); return "redirect:/safety";
    }
    @PostMapping("/blocks/{target}/remove")
    public String unblock(Principal principal,@PathVariable Long target,RedirectAttributes redirect) {
        safety.unblock(principal.getName(),target);
        redirect.addFlashAttribute("notice","ui.person_unblocked_closed_connections_remain_closed"); return "redirect:/safety";
    }
    @GetMapping("/reports/{target}")
    public String report(Principal principal,@PathVariable Long target,Model model) {
        model.addAttribute("target",safety.reportTarget(principal.getName(),target));
        model.addAttribute("reasons",SafetyService.REASONS); return "report";
    }
    @PostMapping("/reports/{target}")
    public String report(Principal principal,@PathVariable Long target,@RequestParam String reason,@RequestParam(defaultValue="") String details,RedirectAttributes redirect) {
        safety.report(principal.getName(),target,reason,details);
        redirect.addFlashAttribute("notice","ui.report_saved_this_prototype_records_reports_but_does_not_provide_live_moderation"); return "redirect:/safety";
    }
}
