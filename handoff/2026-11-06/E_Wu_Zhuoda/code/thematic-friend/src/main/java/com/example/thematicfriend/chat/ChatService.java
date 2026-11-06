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
    private static final DateTimeFormatter CLOCK=DateTimeFormatter.ofPattern("MM-dd HH:mm").withZone(ZoneId.of("Asia/Shanghai"));
    private final AccountService accounts;
    private final ConnectionService connections;
    private final MessageRepository messages;
    private final PairGuard guard;
    public ChatService(AccountService accounts,ConnectionService connections,MessageRepository messages,PairGuard guard) {
        this.accounts=accounts; this.connections=connections; this.messages=messages; this.guard=guard;
    }
    @Transactional
    public void send(String username,Long id,String body) {
        Long actor=accounts.current(username).getId();
        Connection link=connections.require(id,actor);
        guard.lock(link.getLowId(),link.getHighId());
        entityManager.refresh(link);
        connections.require(id,actor);
        String text=body==null?"":body.strip();
        if (text.isBlank()||text.length()>1000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"ui.enter_a_non_blank_message_of_1_1000_characters");
        messages.saveAndFlush(new Message(id,actor,text));
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
    public String preview(Long id) { return messages.findTopByConnectionIdOrderByIdDesc(id).map(Message::getBody).orElse(""); }
}
