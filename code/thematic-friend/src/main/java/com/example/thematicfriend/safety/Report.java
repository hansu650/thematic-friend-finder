package com.example.thematicfriend.safety;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="reports")
public class Report {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long reporterId;
    @Column(nullable=false) private Long targetId;
    @Column(nullable=false,length=30) private String reason;
    @Column(nullable=false,length=1000) private String details;
    private Instant createdAt=Instant.now();
    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus;
    private Long handlerId;
    private Instant handledAt;
    @Column(length=1000)
    private String internalNote;

    public enum ReviewStatus { PENDING, REVIEWED, DISMISSED }
    protected Report() { }
    public Report(Long reporter,Long target,String reason,String details) { reporterId=reporter; targetId=target; this.reason=reason; this.details=details; }
    public Long getId() { return id; }
    public Long getTargetId() { return targetId; }
    public String getReason() { return reason; }
    public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
    public ReviewStatus getReviewStatus() {
        return reviewStatus == null ? ReviewStatus.PENDING : reviewStatus;
    }
    public Long getHandlerId() { return handlerId; }
    public Instant getHandledAt() { return handledAt; }
    public String getInternalNote() { return internalNote; }

    void resolve(ReviewStatus status, Long handlerId, String note) {
        reviewStatus = status;
        this.handlerId = handlerId;
        handledAt = Instant.now();
        internalNote = note;
    }
}
