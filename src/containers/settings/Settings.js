import React from "react";
import { Container, Typography, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Divider } from "@material-ui/core";
import { usePreferences } from "../../contexts/PreferencesContext";

const colorSchemes = [
  { value: "sepia", label: "Sepia" },
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const languages = [
  { value: "french", label: "French" },
  { value: "urdu", label: "Urdu" },
  { value: "norsk", label: "Norsk" },
  { value: "english", label: "English" },
];

const Settings = () => {
  const {
    preferences: { colorScheme, language },
    setColorScheme,
    setLanguage,
  } = usePreferences();

  return (
    <Container maxWidth="md" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <Paper style={{ padding: 24 }}>
        <Typography variant="h5" gutterBottom>
          Preferences
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Choose your preferred color scheme and language for the application.
        </Typography>
        <Divider style={{ marginBottom: 24 }} />

        <FormControl component="fieldset" style={{ marginBottom: 24 }}>
          <FormLabel component="legend">Color scheme</FormLabel>
          <RadioGroup
            aria-label="color-scheme"
            name="color-scheme"
            value={colorScheme}
            onChange={(event) => setColorScheme(event.target.value)}
          >
            {colorSchemes.map((scheme) => (
              <FormControlLabel key={scheme.value} value={scheme.value} control={<Radio color="primary" />} label={scheme.label} />
            ))}
          </RadioGroup>
        </FormControl>

        <Divider style={{ marginBottom: 24 }} />

        <FormControl component="fieldset">
          <FormLabel component="legend">Language</FormLabel>
          <RadioGroup
            aria-label="language"
            name="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {languages.map((option) => (
              <FormControlLabel key={option.value} value={option.value} control={<Radio color="primary" />} label={option.label} />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
    </Container>
  );
};

export default Settings;
