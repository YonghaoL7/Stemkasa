import React, { useState, useEffect } from "react";
import { Container, Paper, Typography } from "@mui/material";
import Appbar from "./Appbar";
import MeetingForm from "./MeetingForm";
import MeetingList from "./MeetingList";

function App() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch('/api/meetings');
        const data = await response.json();
        setMeetings(data.meetings || []);  // Adjust this line based on the actual structure of your response
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  const addMeeting = (meeting) => {
    setMeetings([...meetings, meeting]);
  };

  const deleteMeeting = async (meetingId) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
      } else {
        console.error('Failed to delete meeting:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  return (
    <>
      <Appbar />
      <Container>
        <Paper style={{ padding: 16, marginBottom: 16 }}>
          <MeetingForm onAddMeeting={addMeeting} />
        </Paper>
        <Typography variant="h6" gutterBottom>
          Scheduled Meetings
        </Typography>
        <MeetingList meetings={meetings} onDelete={deleteMeeting} />
      </Container>
    </>
  );
}

export default App;
