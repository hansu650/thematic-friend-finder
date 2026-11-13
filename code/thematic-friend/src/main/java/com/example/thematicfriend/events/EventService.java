package com.example.thematicfriend.events;

import com.example.thematicfriend.account.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EventService {
    public record Card(CommunityEvent event,long attendees,boolean attending,boolean saved) { }
    private final EventRepository events;private final EventActionRepository actions;
    private final AccountService accounts;private final MemberRepository members;
    public EventService(EventRepository events,EventActionRepository actions,AccountService accounts,MemberRepository members){
        this.events=events;this.actions=actions;this.accounts=accounts;this.members=members;
    }
    @Transactional(readOnly=true)
    public List<Card> browse(String username,String query,String city,String category,String view){
        Long memberId=username==null?null:accounts.current(username).getId();
        String term=normalize(query),place=normalize(city);
        return events.findAllByOrderByStartsAtAsc().stream().filter(e->!e.isPast())
                .filter(e->term.isEmpty()||normalize(e.getTitle()+" "+e.getDescription()).contains(term))
                .filter(e->place.isEmpty()||normalize(e.getCity()).contains(place))
                .filter(e->category==null||category.isBlank()||!AccountService.INTERESTS.contains(category)||e.getCategory().equals(category))
                .map(e->card(e,memberId))
                .filter(c->!"saved".equals(view)||c.saved()).filter(c->!"going".equals(view)||c.attending()).toList();
    }
    private String normalize(String value){return value==null?"":value.strip().toLowerCase(Locale.ROOT);}
    @Transactional(readOnly=true) public Card detail(String username,Long id){return card(find(id),accounts.current(username).getId());}
    private Card card(CommunityEvent event,Long memberId){return new Card(event,actions.countByEventIdAndKind(event.getId(),EventAction.Kind.ATTEND),
            memberId!=null&&actions.existsByEventIdAndMemberIdAndKind(event.getId(),memberId,EventAction.Kind.ATTEND),
            memberId!=null&&actions.existsByEventIdAndMemberIdAndKind(event.getId(),memberId,EventAction.Kind.SAVE));}
    public CommunityEvent find(Long id){return events.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"ref.event.not_found"));}
    public Member host(CommunityEvent event){return members.findById(event.getHostId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"ref.event.not_found"));}
    @Transactional(readOnly=true) public List<Member> attendees(Long id){return actions.findByEventIdAndKind(id,EventAction.Kind.ATTEND).stream()
            .map(action->members.findById(action.getMemberId())).flatMap(Optional::stream).limit(12).toList();}
    @Transactional
    public void setAction(String username,Long eventId,EventAction.Kind kind,boolean enabled){
        Long memberId=accounts.current(username).getId();
        CommunityEvent event=events.lockById(eventId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"ref.event.not_found"));
        boolean exists=actions.existsByEventIdAndMemberIdAndKind(eventId,memberId,kind);
        if(!enabled){if(exists)actions.deleteByEventIdAndMemberIdAndKind(eventId,memberId,kind);return;}
        if(exists)return;
        if(event.isPast())throw new ResponseStatusException(HttpStatus.CONFLICT,"ref.event.past");
        if(kind==EventAction.Kind.ATTEND&&actions.countByEventIdAndKind(eventId,kind)>=event.getCapacity())
            throw new ResponseStatusException(HttpStatus.CONFLICT,"ref.event.full");
        actions.saveAndFlush(new EventAction(eventId,memberId,kind));
    }
    @Transactional
    public CommunityEvent create(String username,EventForm form){
        if(!AccountService.INTERESTS.contains(form.getCategory())||form.getStartsAt()==null||!form.getStartsAt().isAfter(LocalDateTime.now()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"ref.event.invalid");
        return events.save(new CommunityEvent(form.getTitle().strip(),form.getDescription().strip(),form.getCategory(),form.getVenue().strip(),
                form.getCity().strip(),form.getStartsAt(),form.getCapacity(),accounts.current(username).getId(),imageFor(form.getCategory())));
    }
    public static String imageFor(String category){return EventPhotos.imageFor(category);}
}
