package com.example.thematicfriend.events;

import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

public class EventForm {
    @NotBlank @Size(max=140) private String title="";
    @NotBlank @Size(max=4000) private String description="";
    @NotBlank @Size(max=30) private String category="Coffee";
    @NotBlank @Size(max=120) private String venue="";
    @NotBlank @Size(max=60) private String city="";
    @NotNull @Future @DateTimeFormat(pattern="yyyy-MM-dd'T'HH:mm")
    private LocalDateTime startsAt=LocalDateTime.now().plusDays(1).withHour(16).withMinute(0).withSecond(0).withNano(0);
    @Min(2) @Max(100) private int capacity=12;
    public String getTitle(){return title;}public void setTitle(String value){title=value;}
    public String getDescription(){return description;}public void setDescription(String value){description=value;}
    public String getCategory(){return category;}public void setCategory(String value){category=value;}
    public String getVenue(){return venue;}public void setVenue(String value){venue=value;}
    public String getCity(){return city;}public void setCity(String value){city=value;}
    public LocalDateTime getStartsAt(){return startsAt;}public void setStartsAt(LocalDateTime value){startsAt=value;}
    public int getCapacity(){return capacity;}public void setCapacity(int value){capacity=value;}
}
