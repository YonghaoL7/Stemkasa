import React, { useState } from "react";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Grid } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function MeetingForm({ onAddMeeting }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60); // Default to 60 minutes
  const [tz, setTz] = useState("UTC");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (title && date && time && tz && duration) {
      // Combine date and time, then convert it to UTC based on the selected time zone
      const localDateTime = dayjs(`${date}T${time}`).tz(tz);
      const utcDateTime = localDateTime.utc().format();

      const response = await fetch('/api/createMeeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: title,
          start_time: utcDateTime,
          type: 2,
          duration: duration,
          timezone: tz,
          agenda: 'Meeting agenda',
          attendees: [{ email: 'example@example.com' }] // Example attendee
        }),
      });

      const newMeeting = await response.json();
      console.log('New Meeting: ', newMeeting);
      onAddMeeting(newMeeting);  // Add the new meeting to the list
      setTitle("");
      setDate("");
      setTime("");
      setDuration(60);
      setTz("UTC");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Meeting Title"
        variant="outlined"
        fullWidth
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="Date"
        type="date"
        variant="outlined"
        fullWidth
        margin="normal"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Time"
        type="time"
        variant="outlined"
        fullWidth
        margin="normal"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Time Zone</InputLabel>
            <Select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              label="Time Zone"
            >
              <MenuItem value="UTC">UTC</MenuItem>
              <MenuItem value="America/New_York">America/New York (Eastern)</MenuItem>
              <MenuItem value="America/Chicago">America/Chicago (Central)</MenuItem>
              <MenuItem value="America/Denver">America/Denver (Mountain)</MenuItem>
              <MenuItem value="America/Los_Angeles">America/Los Angeles (Pacific)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Duration (minutes)"
            type="number"
            variant="outlined"
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </Grid>
      </Grid>
      <Box marginTop={2}>
        <Button type="submit" variant="contained" color="primary">
          Add Meeting
        </Button>
      </Box>
    </form>
  );
}

export default MeetingForm;
