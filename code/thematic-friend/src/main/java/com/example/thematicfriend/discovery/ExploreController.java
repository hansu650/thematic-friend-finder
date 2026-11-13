package com.example.thematicfriend.discovery;

import com.example.thematicfriend.account.AccountService;
import com.example.thematicfriend.connection.ConnectionService;
import com.example.thematicfriend.events.EventService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.security.Principal;

@Controller
public class ExploreController {
    private final DiscoveryService discovery;
    private final AccountService accounts;
    private final ConnectionService connections;
    private final EventService events;
    public ExploreController(DiscoveryService discovery, AccountService accounts, ConnectionService connections, EventService events) {
        this.discovery=discovery; this.accounts=accounts; this.connections=connections;this.events=events;
    }
    @GetMapping("/explore")
    public String explore(Principal principal, @RequestParam(defaultValue="") String interest, Model model) {
        String selected=DiscoveryService.validInterest(interest);
        var candidates=discovery.discover(principal.getName(),selected,"");
        var contacts=connections.forMember(accounts.current(principal.getName()).getId());
        model.addAttribute("stars",candidates.stream().limit(12).toList());
        model.addAttribute("starCount",candidates.size());
        model.addAttribute("selectedInterest",selected);
        model.addAttribute("connectionCount",contacts.size());
        model.addAttribute("activePage","explore");
        model.addAttribute("events",events.browse(principal.getName(),"","",selected,"").stream().limit(6).toList());
        return "explore";
    }
}
