package com.example.thematicfriend.discovery;

import com.example.thematicfriend.connection.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.util.UriComponentsBuilder;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class DiscoveryController {
    private final DiscoveryService discovery;
    private final ConnectionService connections;
    public DiscoveryController(DiscoveryService discovery,ConnectionService connections) { this.discovery=discovery; this.connections=connections; }
    @GetMapping("/discover")
    public String discover(Principal principal,@RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal,
                           @RequestParam(required=false) Long member,Model model) {
        List<DiscoveryService.Candidate> candidates=discovery.discover(principal.getName(),interest,goal);
        var selected=member==null?(candidates.isEmpty()?null:candidates.getFirst()):candidates.stream()
                .filter(c->c.member().getId().equals(member)).findFirst()
                .orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"ref.person.unavailable"));
        model.addAttribute("selectedInterest",DiscoveryService.validInterest(interest));
        model.addAttribute("selectedGoal",DiscoveryService.validGoal(goal));
        model.addAttribute("candidate",selected);
        model.addAttribute("remaining",candidates.size());
        model.addAttribute("hasFilters",!DiscoveryService.validInterest(interest).isEmpty() || !DiscoveryService.validGoal(goal).isEmpty());
        model.addAttribute("revisitableSkips",candidates.isEmpty()?discovery.revisitableSkips(principal.getName(),interest,goal):0);
        model.addAttribute("upNext",candidates.stream().filter(c->selected==null||!c.member().getId().equals(selected.member().getId())).limit(3).toList());
        model.addAttribute("activePage","discover");
        return "discover";
    }
    @PostMapping("/decisions/{target}")
    public String decide(Principal principal,@PathVariable Long target,@RequestParam Decision.Choice choice,
                         @RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal,RedirectAttributes redirect) {
        var match=connections.decide(principal.getName(),target,choice);
        if(match.isPresent()) return location("/matches/"+match.get().getId(),interest,goal);
        redirect.addFlashAttribute("notice",choice==Decision.Choice.LIKE?"ui.like_saved_you_can_chat_when_you_both_like_each_other":"ui.on_to_the_next_person_you_can_revisit_skipped_profiles_later");
        return back(interest,goal);
    }
    @PostMapping("/decisions/reset")
    public String reset(Principal principal,@RequestParam(defaultValue="") String interest,@RequestParam(defaultValue="") String goal) {
        connections.resetSkips(principal.getName()); return back(interest,goal);
    }
    private String back(String interest,String goal) {
        return location("/discover",interest,goal);
    }
    private String location(String route,String interest,String goal) {
        return "redirect:"+UriComponentsBuilder.fromPath(route).queryParam("interest",DiscoveryService.validInterest(interest))
                .queryParam("goal",DiscoveryService.validGoal(goal)).build().encode().toUriString();
    }
}
