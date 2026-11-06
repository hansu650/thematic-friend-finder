package com.example.thematicfriend.config;

import com.example.thematicfriend.account.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.util.UriComponentsBuilder;
import java.security.Principal;
import java.util.Map;

@ControllerAdvice
public class PageAdvice {
    private final AccountService accounts;
    private final Environment environment;
    private final I18n i18n;
    public PageAdvice(AccountService accounts,Environment environment,I18n i18n) { this.accounts=accounts; this.environment=environment; this.i18n=i18n; }
    @ModelAttribute
    public void common(Model model,Principal principal,HttpServletRequest request) {
        model.addAttribute("me",principal==null?null:accounts.current(principal.getName()));
        model.addAttribute("allInterests",AccountService.INTERESTS);
        model.addAttribute("allGoals",AccountService.GOALS);
        model.addAttribute("demoMode",environment.matchesProfiles("demo"));
        model.addAttribute("chineseEnabled",environment.getProperty("app.chinese-enabled",Boolean.class,true));
        UriComponentsBuilder location=UriComponentsBuilder.fromPath(request.getRequestURI());
        for(String parameter:new String[]{"interest","goal"}) {
            if(request.getParameter(parameter)!=null) location.queryParam(parameter,request.getParameter(parameter));
        }
        model.addAttribute("englishUrl",location.cloneBuilder().queryParam("lang","en").build().encode().toUriString());
        model.addAttribute("chineseUrl",location.cloneBuilder().queryParam("lang","zh").build().encode().toUriString());
    }
    @ExceptionHandler(ResponseStatusException.class)
    public Object responseError(ResponseStatusException error,HttpServletRequest request) {
        String message=error.getReason()==null?"ui.this_action_could_not_be_completed_please_go_back_and_try_again":error.getReason();
        message=i18n.text(message);
        if (request.getRequestURI().startsWith("/api/")) return ResponseEntity.status(error.getStatusCode()).body(Map.of("error",message));
        ModelAndView view=new ModelAndView("error");
        view.setStatus(error.getStatusCode());
        view.addObject("status",error.getStatusCode().value());
        view.addObject("explanation",message);
        return view;
    }
}
