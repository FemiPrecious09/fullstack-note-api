export const buildPersonalization = (profile) => {
  if (!profile) return ""
  const analogy = `The reader works as a ${profile.occupation} in ${profile.industry}, enjoys ${profile.hobbies}, and prefers ${profile.learning_style} explanations. Whenever it helps, use analogies from their own world — their work or hobbies — to make things click for them.`
  const language = profile.language_preference === "pidgin"
    ? " Respond entirely in Nigerian Pidgin English, written naturally and warmly, the way a Nigerian friend would explain something to another Nigerian — not an exaggerated or stiff caricature."
    : ""
  return `${analogy}${language}`
}
