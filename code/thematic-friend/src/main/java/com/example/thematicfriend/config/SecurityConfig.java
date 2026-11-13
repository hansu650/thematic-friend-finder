package com.example.thematicfriend.config;

import com.example.thematicfriend.account.MemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService userDetailsService(MemberRepository members,
            @Value("${app.review.staff-member-id:0}") long staffMemberId) {
        return username -> members.findByUsername(username)
                .map(m -> User.withUsername(m.getUsername()).password(m.getPasswordHash())
                        .roles(staffMemberId > 0 && m.getId() == staffMemberId
                                ? new String[]{"USER", "STAFF"} : new String[]{"USER"}).build())
                .orElseThrow(() -> new UsernameNotFoundException("ui.incorrect_username_or_password"));
    }
    @Bean SecurityFilterChain webSecurity(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/staff/reports", "/staff/reports/**").hasRole("STAFF")
                .requestMatchers("/", "/login", "/signup", "/privacy", "/css/**", "/js/**", "/images/**", "/error").permitAll()
                .anyRequest().authenticated())
            .formLogin(form -> form.loginPage("/login").defaultSuccessUrl("/discover", true).failureUrl("/login?error").permitAll())
            .logout(logout -> logout.logoutSuccessUrl("/?loggedout"))
            .exceptionHandling(errors -> errors.defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    PathPatternRequestMatcher.withDefaults().matcher("/api/**"))
                    .defaultAuthenticationEntryPointFor(new LoginUrlAuthenticationEntryPoint("/login"),
                            PathPatternRequestMatcher.withDefaults().matcher("/**")));
        return http.build();
    }
}
