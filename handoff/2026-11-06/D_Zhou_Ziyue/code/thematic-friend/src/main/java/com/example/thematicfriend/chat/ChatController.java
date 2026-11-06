package com.example.thematicfriend.chat;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.connection.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.security.Principal;
import java.util.List;

@Controller
public class ChatController {
    public record Contact(Connection link,Member partner,String preview) { }
    private final AccountService accounts;
    private final ConnectionService connections;
    private final ChatService chat;
    public ChatController(AccountService accounts,ConnectionService connections,ChatService chat) { this.accounts=accounts; this.connections=connections; this.chat=chat; }
    @GetMapping("/connections")
    public String connections(Principal principal,Model model) {
        Long actor=accounts.current(principal.getName()).getId();
        model.addAttribute("contacts",connections.forMember(actor).stream().map(c -> new Contact(c,accounts.member(c.other(actor)),chat.preview(c.getId()))).toList());
        model.addAttribute("activePage","connections"); return "connections";
    }
    @GetMapping("/conversations/{id}")
    public String conversation(Principal principal,@PathVariable Long id,Model model) {
        Long actor=accounts.current(principal.getName()).getId();
        Connection link=connections.require(id,actor);
        var messages=chat.read(principal.getName(),id,null);
        model.addAttribute("connection",link);
        model.addAttribute("partner",accounts.member(link.other(actor)));
        model.addAttribute("messages",messages);
        model.addAttribute("cursor",messages.isEmpty()?0:messages.getLast().id());
        model.addAttribute("activePage","connections"); return "conversation";
    }
    @PostMapping("/conversations/{id}/messages")
    public String send(Principal principal,@PathVariable Long id,@RequestParam String body,RedirectAttributes redirect) {
        try { chat.send(principal.getName(),id,body); }
        catch(ResponseStatusException e) {
            if(e.getStatusCode().value()!=400) throw e;
            redirect.addFlashAttribute("messageError",e.getReason());
        }
        return "redirect:/conversations/"+id;
    }
    @GetMapping("/api/conversations/{id}/messages") @ResponseBody
    public List<ChatService.MessageView> poll(Principal principal,@PathVariable Long id,@RequestParam(defaultValue="0") Long after) {
        return chat.read(principal.getName(),id,after);
    }
    @PostMapping("/connections/{id}/end")
    public String end(Principal principal,@PathVariable Long id,RedirectAttributes redirect) {
        connections.end(principal.getName(),id);
        redirect.addFlashAttribute("notice","ui.connection_ended_neither_participant_can_use_this_conversation_again");
        return "redirect:/connections";
    }
}
