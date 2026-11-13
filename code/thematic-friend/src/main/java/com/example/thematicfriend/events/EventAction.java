package com.example.thematicfriend.events;

import jakarta.persistence.*;

@Entity
@Table(name="event_actions",uniqueConstraints=@UniqueConstraint(columnNames={"event_id","member_id","action_kind"}))
public class EventAction {
    public enum Kind { ATTEND, SAVE }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="event_id",nullable=false) private Long eventId;
    @Column(name="member_id",nullable=false) private Long memberId;
    @Enumerated(EnumType.STRING) @Column(name="action_kind",nullable=false,length=10) private Kind kind;
    protected EventAction(){ }
    public EventAction(Long eventId,Long memberId,Kind kind){this.eventId=eventId;this.memberId=memberId;this.kind=kind;}
    public Long getMemberId(){return memberId;}
}
