package com.example.thematicfriend.account;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Locale;

@Controller
public class AccountController {
    private final AccountService accounts;
    private final MemberRepository members;
    public AccountController(AccountService accounts,MemberRepository members) { this.accounts=accounts; this.members=members; }
    @GetMapping("/") public String welcome() { return "welcome"; }
    @GetMapping("/privacy") public String privacy() { return "privacy"; }
    @GetMapping("/login") public String login() { return "login"; }
    @GetMapping("/signup") public String signup(Model model) { model.addAttribute("signupForm",new SignupForm()); return "signup"; }
    @PostMapping("/signup")
    public String register(@Valid @ModelAttribute SignupForm signupForm,BindingResult errors) {
        if (signupForm.getPassword()!=null && signupForm.getPassword().getBytes(StandardCharsets.UTF_8).length>72) errors.rejectValue("password","ui.use_a_password_of_no_more_than_72_utf_8_bytes");
        if (signupForm.getUsername()!=null && members.existsByUsername(signupForm.getUsername().toLowerCase(Locale.ROOT))) errors.rejectValue("username","ui.that_username_is_already_taken_please_choose_another");
        if (errors.hasErrors()) return "signup";
        try { accounts.register(signupForm); }
        catch (DataIntegrityViolationException e) { errors.rejectValue("username","ui.that_username_is_already_taken_please_choose_another"); return "signup"; }
        return "redirect:/login?registered";
    }
    @GetMapping("/profile")
    public String profile(Principal principal,Model model) { model.addAttribute("profileForm",new ProfileForm(accounts.current(principal.getName()))); return "profile"; }
    @PostMapping("/profile")
    public String saveProfile(Principal principal,@Valid @ModelAttribute ProfileForm profileForm,BindingResult errors,RedirectAttributes redirect) {
        if (!AccountService.INTERESTS.containsAll(profileForm.getInterests())) errors.rejectValue("interests","ui.choose_interests_from_the_list");
        if (!AccountService.GOALS.contains(profileForm.getGoal())) errors.rejectValue("goal","ui.choose_an_activity_from_the_list");
        if (errors.hasErrors()) return "profile";
        accounts.update(principal.getName(),profileForm);
        redirect.addFlashAttribute("notice","ui.profile_saved_discover_people_who_share_your_interests");
        return "redirect:/profile";
    }
}
