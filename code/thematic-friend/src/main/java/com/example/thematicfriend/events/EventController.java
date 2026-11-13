package com.example.thematicfriend.events;

import com.example.thematicfriend.account.AccountService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.security.Principal;

@Controller
public class EventController {
    private final EventService events;
    public EventController(EventService events){this.events=events;}
    @GetMapping("/events")
    public String browse(Principal principal,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="") String city,
                         @RequestParam(defaultValue="") String category,@RequestParam(defaultValue="") String view,Model model){
        model.addAttribute("events",events.browse(principal.getName(),q,city,category,view));
        model.addAttribute("query",q);model.addAttribute("city",city);model.addAttribute("category",category);model.addAttribute("eventView",view);
        return "events";
    }
    @GetMapping("/events/{id:\\d+}")
    public String detail(Principal principal,@PathVariable Long id,Model model){
        var card=events.detail(principal.getName(),id);model.addAttribute("card",card);model.addAttribute("event",card.event());
        model.addAttribute("host",events.host(card.event()));model.addAttribute("attendees",events.attendees(id));
        model.addAttribute("related",events.browse(principal.getName(),"","","","").stream().filter(c->!c.event().getId().equals(id)).limit(3).toList());
        return "event-detail";
    }
    @PostMapping("/events/{id}/attendance")
    public String attend(Principal principal,@PathVariable Long id,@RequestParam boolean attending,RedirectAttributes redirect){
        events.setAction(principal.getName(),id,EventAction.Kind.ATTEND,attending);
        redirect.addFlashAttribute("notice",attending?"ref.event.joined":"ref.event.left");return "redirect:/events/"+id;
    }
    @PostMapping("/events/{id}/save")
    public String save(Principal principal,@PathVariable Long id,@RequestParam boolean saved,RedirectAttributes redirect){
        events.setAction(principal.getName(),id,EventAction.Kind.SAVE,saved);
        redirect.addFlashAttribute("notice",saved?"ref.event.saved":"ref.event.unsaved");return "redirect:/events/"+id;
    }
    @GetMapping("/events/new") public String form(Model model){model.addAttribute("eventForm",new EventForm());return "event-form";}
    @PostMapping("/events")
    public String create(Principal principal,@Valid @ModelAttribute EventForm eventForm,BindingResult errors){
        if(!AccountService.INTERESTS.contains(eventForm.getCategory()))errors.rejectValue("category","ui.choose_interests_from_the_list");
        if(errors.hasErrors())return "event-form";
        return "redirect:/events/"+events.create(principal.getName(),eventForm).getId();
    }
}
