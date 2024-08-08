import React from "react";
import {
  Paper,
  Grid,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

function MeetingList({ meetings, onDelete }) {
  return (
    <Grid container spacing={2}>
      {meetings.map((meeting, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box>
              <Typography variant="subtitle1" component="h5">
                {meeting.topic || "No Title"}
              </Typography>
              <Typography variant="body2" component="p">
                {new Date(meeting.start_time).toLocaleString()}
              </Typography>
              <Typography variant="body2" component="p">
                {meeting.agenda || "No Agenda"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 1,
                }}
              ></Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 1,
                }}
              >
                <Button variant="contained" href={meeting.join_url} target="_blank">
                  Join Meeting
                </Button>
                <IconButton aria-label="delete" onClick={() => onDelete(meeting.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default MeetingList;
