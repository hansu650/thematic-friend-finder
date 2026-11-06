package com.example.thematicfriend.discovery;

import com.example.thematicfriend.account.AccountService;
import com.example.thematicfriend.connection.ConnectionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;

/** Discovery feedback only; the existing conversation remains D's integration surface. */
@Controller
public class MatchController {
    private final AccountService accounts;
    private final ConnectionService connections;

    public MatchController(AccountService accounts, ConnectionService connections) {
        this.accounts = accounts;
        this.connections = connections;
    }

    @GetMapping("/matches/{id}")
    public String match(Principal principal, @PathVariable Long id,
                        @RequestParam(defaultValue="") String interest,
                        @RequestParam(defaultValue="") String goal, Model model) {
        var actor = accounts.current(principal.getName());
        var connection = connections.require(id, actor.getId());
        var partner = accounts.member(connection.other(actor.getId()));
        model.addAttribute("connection", connection);
        model.addAttribute("partner", partner);
        model.addAttribute("shared", partner.getInterests().stream().filter(actor.getInterests()::contains).toList());
        model.addAttribute("selectedInterest", DiscoveryService.validInterest(interest));
        model.addAttribute("selectedGoal", DiscoveryService.validGoal(goal));
        return "match";
    }
}
