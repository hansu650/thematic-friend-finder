package com.example.thematicfriend.events;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Entity
@Table(name="community_events")
public class CommunityEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=140) private String title;
    @Column(nullable=false,length=4000) private String description;
    @Column(nullable=false,length=30) private String category;
    @Column(nullable=false,length=120) private String venue;
    @Column(nullable=false,length=60) private String city;
    @Column(nullable=false) private LocalDateTime startsAt;
    @Column(nullable=false) private int capacity;
    @Column(nullable=false) private Long hostId;
    @Column(nullable=false,length=100) private String image;
    protected CommunityEvent() { }
    public CommunityEvent(String title,String description,String category,String venue,String city,
                          LocalDateTime startsAt,int capacity,Long hostId,String image) {
        this.title=title;this.description=description;this.category=category;this.venue=venue;this.city=city;
        this.startsAt=startsAt;this.capacity=capacity;this.hostId=hostId;this.image=image;
    }
    public Long getId(){return id;} public String getTitle(){return title;}
    public String getDescription(){return description;} public String getCategory(){return category;}
    public String getVenue(){return venue;} public String getCity(){return city;}
    public LocalDateTime getStartsAt(){return startsAt;} public int getCapacity(){return capacity;}
    public Long getHostId(){return hostId;} public String getImage(){return image;}
    public boolean isPast(){return !startsAt.isAfter(LocalDateTime.now());}
    public String dateLabel(String language){return startsAt.format(DateTimeFormatter.ofPattern(
            "zh".equals(language)?"M月d日 EEEE":"EEEE, MMM d", "zh".equals(language)?Locale.CHINA:Locale.US));}
    public String timeLabel(){return startsAt.format(DateTimeFormatter.ofPattern("HH:mm"));}
}
