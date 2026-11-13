package com.example.thematicfriend;

import com.example.thematicfriend.account.*;
import com.example.thematicfriend.bootstrap.DemoEvents;
import com.example.thematicfriend.events.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:event-flow;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class EventFlowTests {
    @Autowired MockMvc mvc;@Autowired EventRepository events;@Autowired EventActionRepository actions;
    @Autowired EventService service;@Autowired MemberRepository members;
    Member first,second,third;CommunityEvent event;
    @BeforeEach void fixtures(){
        actions.deleteAll();events.deleteAll();members.deleteAll();
        first=members.save(new Member("event_first","unused","First"));second=members.save(new Member("event_second","unused","Second"));
        third=members.save(new Member("event_third","unused","Third"));
        event=events.save(new CommunityEvent("Coffee and books","A quiet afternoon.","Coffee","Bookshop","Wuhan",LocalDateTime.now().plusDays(2),2,first.getId(),"hinge-fountain.jpg"));
    }
    @Test void attendanceRequiresAuthenticationAndCsrf() throws Exception {
        mvc.perform(get("/events/"+event.getId())).andExpect(status().is3xxRedirection());
        mvc.perform(post("/events/"+event.getId()+"/attendance").with(user(first.getUsername())).param("attending","true"))
                .andExpect(status().isForbidden());
        assertThat(actions.count()).isZero();
    }
    @Test void twoAccountsJoinIdempotentlyAndCapacityIsEnforced() throws Exception {
        for(int i=0;i<2;i++)mvc.perform(post("/events/"+event.getId()+"/attendance").with(user(first.getUsername())).with(csrf()).param("attending","true"))
                .andExpect(status().is3xxRedirection());
        mvc.perform(post("/events/"+event.getId()+"/attendance").with(user(second.getUsername())).with(csrf()).param("attending","true"))
                .andExpect(status().is3xxRedirection());
        mvc.perform(post("/events/"+event.getId()+"/attendance").with(user(third.getUsername())).with(csrf()).param("attending","true"))
                .andExpect(status().isConflict());
        assertThat(service.detail(first.getUsername(),event.getId()).attendees()).isEqualTo(2);
    }
    @Test void cancellationOnlyChangesTheSignedInAccountsAttendance() throws Exception {
        service.setAction(first.getUsername(),event.getId(),EventAction.Kind.ATTEND,true);
        service.setAction(second.getUsername(),event.getId(),EventAction.Kind.ATTEND,true);
        mvc.perform(post("/events/"+event.getId()+"/attendance").with(user(first.getUsername())).with(csrf())
                .param("attending","false").param("memberId",second.getId().toString())).andExpect(status().is3xxRedirection());
        assertThat(service.detail(first.getUsername(),event.getId()).attending()).isFalse();
        assertThat(service.detail(second.getUsername(),event.getId()).attending()).isTrue();
        service.setAction(third.getUsername(),event.getId(),EventAction.Kind.ATTEND,true);
        assertThat(service.detail(second.getUsername(),event.getId()).attendees()).isEqualTo(2);
    }
    @Test void savedEventsArePersonalAndSeparateFromAttendance(){
        service.setAction(first.getUsername(),event.getId(),EventAction.Kind.SAVE,true);
        service.setAction(first.getUsername(),event.getId(),EventAction.Kind.SAVE,true);
        assertThat(service.browse(first.getUsername(),"","","","saved")).hasSize(1);
        assertThat(service.browse(second.getUsername(),"","","","saved")).isEmpty();
        assertThat(service.detail(first.getUsername(),event.getId()).attendees()).isZero();
        service.setAction(first.getUsername(),event.getId(),EventAction.Kind.SAVE,false);
        assertThat(service.browse(first.getUsername(),"","","","saved")).isEmpty();
    }
    @Test void searchCombinesQueryCityAndCategoryAndHidesPastEvents(){
        events.save(new CommunityEvent("Past coffee","Earlier.","Coffee","Bookshop","Wuhan",LocalDateTime.now().minusDays(1),3,first.getId(),"hinge-fountain.jpg"));
        assertThat(service.browse(first.getUsername(),"BOOKS","wu","Coffee","")).hasSize(1);
        assertThat(service.browse(first.getUsername(),"books","Elsewhere","Coffee","")).isEmpty();
        assertThat(service.browse(first.getUsername(),"","","Music","")).isEmpty();
    }
    @Test void expandingFixturesPreservesExistingEventsActionsAndDatesAcrossRestarts(){
        var host=members.save(new Member("demo_zhou","unused","Host"));
        var previousDate=LocalDateTime.now().minusDays(3).withNano(0);
        var previous=events.save(new CommunityEvent("Book Club · 交换你喜欢的一本书","Original description.","Reading",
                "Original bookshop","Wuhan",previousDate,7,host.getId(),"meetup-group.jpeg"));
        service.setAction(first.getUsername(),event.getId(),EventAction.Kind.ATTEND,true);
        service.setAction(second.getUsername(),event.getId(),EventAction.Kind.SAVE,true);
        var fixture=new DemoEvents(events,members);
        fixture.run();
        assertThat(events.count()).isEqualTo(19);
        var ids=events.findAll().stream().map(CommunityEvent::getId).toList();
        fixture.run();
        assertThat(events.findAll().stream().map(CommunityEvent::getId)).containsExactlyInAnyOrderElementsOf(ids);
        var preserved=events.findById(previous.getId()).orElseThrow();
        assertThat(preserved.getStartsAt()).isEqualTo(previousDate);
        assertThat(preserved.getDescription()).isEqualTo("Original description.");
        assertThat(preserved.getCapacity()).isEqualTo(7);
        assertThat(preserved.getImage()).isEqualTo("meetup-group.jpeg");
        assertThat(new EventPhotos().url(preserved)).isEqualTo("/images/activity-photos/book-club.jpg");
        assertThat(events.findById(event.getId()).orElseThrow().getTitle()).isEqualTo("Coffee and books");
        assertThat(service.detail(first.getUsername(),event.getId()).attending()).isTrue();
        assertThat(service.detail(second.getUsername(),event.getId()).saved()).isTrue();
        assertThat(actions.count()).isEqualTo(2);
    }
    @Test void eventCreationUsesTheAuthenticatedHostAndRejectsInvalidForm() throws Exception {
        long before=events.count();
        mvc.perform(post("/events").with(user(first.getUsername())).with(csrf()).param("title","New walk").param("description","Meet in the park.")
                .param("category","Hiking").param("venue","Park gate").param("city","Wuhan").param("startsAt",LocalDateTime.now().plusDays(3).withSecond(0).withNano(0).toString())
                .param("capacity","8").param("hostId",second.getId().toString())).andExpect(status().is3xxRedirection());
        assertThat(events.count()).isEqualTo(before+1);
        assertThat(events.findAll().stream().filter(e->e.getTitle().equals("New walk")).findFirst().orElseThrow().getHostId()).isEqualTo(first.getId());
        mvc.perform(post("/events").with(user(first.getUsername())).with(csrf()).param("title"," ").param("capacity","999"))
                .andExpect(status().isOk()).andExpect(model().attributeHasFieldErrors("eventForm","title","capacity"));
        assertThat(events.count()).isEqualTo(before+1);
    }
}
