package com.yuri.aiorder.staff;

import java.util.List;

public record StaffAccountOptionsResponse(List<Option> departments, List<Option> posts) {
    public record Option(long id, String name) {
    }
}
