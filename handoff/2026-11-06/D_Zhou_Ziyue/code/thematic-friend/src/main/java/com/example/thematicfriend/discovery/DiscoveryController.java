package com.example.thematicfriend.discovery;

import com.example.thematicfriend.connection.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;
import java.security.Principal;
import java.util.List;

@Controller
public class DiscoveryController {
    private final DiscoveryService discovery;
    private final ConnectionService connections;
    public DiscoveryController(DiscoveryService discovery,ConnectionService connections) { this.discovery=discovery; this.connections=connections; }
    @GetMapping("/discover")
    public String discover(Principal principal,@RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal,Model model) {
        List<DiscoveryService.Candidate> candidates=discovery.discover(principal.getName(),interest,goal);
        model.addAttribute("selectedInterest",DiscoveryService.validInterest(interest));
        model.addAttribute("selectedGoal",DiscoveryService.validGoal(goal));
        model.addAttribute("candidate",candidates.isEmpty()?null:candidates.getFirst());
        model.addAttribute("remaining",candidates.size());
        model.addAttribute("upNext",candidates.stream().skip(1).limit(3).toList());
        model.addAttribute("activePage","discover");
        return "discover";
    }
    @PostMapping("/decisions/{target}")
    public String decide(Principal principal,@PathVariable Long target,@RequestParam Decision.Choice choice,
                         @RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal,RedirectAttributes redirect) {
        var match=connections.decide(principal.getName(),target,choice);
        if(match.isPresent()) { redirect.addFlashAttribute("notice","ui.it_is_a_mutual_like_start_with_a_shared_interest"); return "redirect:/conversations/"+match.get().getId(); }
        redirect.addFlashAttribute("notice",choice==Decision.Choice.LIKE?"ui.like_saved_you_can_chat_when_you_both_like_each_other":"ui.on_to_the_next_person_you_can_revisit_skipped_profiles_later");
        return back(interest,goal);
    }
    @PostMapping("/decisions/reset")
    public String reset(Principal principal,@RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal) {
        connections.resetSkips(principal.getName()); return back(interest,goal);
    }
    private String back(String interest,String goal) {
        return "redirect:"+UriComponentsBuilder.fromPath("/discover").queryParam("interest",DiscoveryService.validInterest(interest))
                .queryParam("goal",DiscoveryService.validGoal(goal)).build().encode().toUriString();
    }
}
