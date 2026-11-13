package com.example.thematicfriend.chat;

import com.example.thematicfriend.account.AccountService;
import com.example.thematicfriend.connection.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ChatService {
    @PersistenceContext private EntityManager entityManager;
    public record MessageView(Long id,String body,String time,boolean mine) { }
    public record ReadReceipt(Long lastReadMessageId,long unreadCount) { }
    public record HistoryPage(List<MessageView> messages,boolean hasOlder,Long nextBefore) { }
    private static final DateTimeFormatter CLOCK=DateTimeFormatter.ofPattern("MM-dd HH:mm").withZone(ZoneId.of("Asia/Shanghai"));
    private final AccountService accounts;
    private final ConnectionService connections;
    private final MessageRepository messages;
    private final ConversationReadStateRepository readStates;
    private final PairGuard guard;
    public ChatService(AccountService accounts,ConnectionService connections,MessageRepository messages,
                       ConversationReadStateRepository readStates,PairGuard guard) {
        this.accounts=accounts; this.connections=connections; this.messages=messages;
        this.readStates=readStates; this.guard=guard;
    }
    @Transactional
    public MessageView send(String username,Long id,String body) {
        Long actor=accounts.current(username).getId();
        Connection link=connections.require(id,actor);
        guard.lock(link.getLowId(),link.getHighId());
        entityManager.refresh(link);
        connections.require(id,actor);
        String text=body==null?"":body.strip();
        if (text.isBlank()||text.length()>1000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"ui.enter_a_non_blank_message_of_1_1000_characters");
        Message saved=messages.saveAndFlush(new Message(id,actor,text));
        return new MessageView(saved.getId(),saved.getBody(),CLOCK.format(saved.getSentAt()),true);
    }
    public List<MessageView> read(String username,Long id,Long after) {
        Long actor=accounts.current(username).getId();
        connections.require(id,actor);
        List<Message> found;
        if (after==null) {
            found=new ArrayList<>(messages.findTop100ByConnectionIdOrderByIdDesc(id));
            Collections.reverse(found);
        } else {
            if (after<0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            found=messages.findTop100ByConnectionIdAndIdGreaterThanOrderByIdAsc(id,after);
        }
        return found.stream().map(m -> new MessageView(m.getId(),m.getBody(),CLOCK.format(m.getSentAt()),m.getSenderId().equals(actor))).toList();
    }
    public HistoryPage history(String username,Long id,Long before) {
        Long actor=accounts.current(username).getId();
        connections.require(id,actor);
        if (before==null||before<1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        List<Message> found=new ArrayList<>(messages.findTop101ByConnectionIdAndIdLessThanOrderByIdDesc(id,before));
        boolean hasOlder=found.size()>100;
        if (hasOlder) found.removeLast();
        Collections.reverse(found);
        List<MessageView> views=found.stream().map(m -> new MessageView(m.getId(),m.getBody(),CLOCK.format(m.getSentAt()),m.getSenderId().equals(actor))).toList();
        Long nextBefore=hasOlder&&!found.isEmpty()?found.getFirst().getId():null;
        return new HistoryPage(views,hasOlder,nextBefore);
    }
    public String preview(Long id) { return messages.findTopByConnectionIdOrderByIdDesc(id).map(Message::getBody).orElse(""); }
    @Transactional
    public ReadReceipt acknowledgeRead(String username,Long id,Long throughMessageId) {
        Long actor=accounts.current(username).getId();
        Connection link=connections.require(id,actor);
        guard.lock(link.getLowId(),link.getHighId());
        entityManager.refresh(link);
        connections.require(id,actor);
        if (throughMessageId==null||throughMessageId<1||messages.findByIdAndConnectionId(throughMessageId,id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"ui.message_not_found_for_this_conversation");
        }
        ConversationReadState state=readStates.findByConnectionIdAndParticipantId(id,actor)
                .orElseGet(() -> new ConversationReadState(id,actor));
        state.advanceTo(throughMessageId);
        readStates.saveAndFlush(state);
        long unread=messages.countByConnectionIdAndSenderIdNotAndIdGreaterThan(id,actor,state.getLastReadMessageId());
        return new ReadReceipt(state.getLastReadMessageId(),unread);
    }
    public long unreadCount(String username,Long id) {
        Long actor=accounts.current(username).getId();
        connections.require(id,actor);
        long lastRead=readStates.findByConnectionIdAndParticipantId(id,actor)
                .map(ConversationReadState::getLastReadMessageId).orElse(0L);
        return messages.countByConnectionIdAndSenderIdNotAndIdGreaterThan(id,actor,lastRead);
    }
}
