function createLearnDescriptor(view, subject, topic) {
  return {
    intent: "open_learn_view",
    view,
    subject: subject || "Mathematics",
    topic: topic || "",
  };
}

export function buildLearnLinks({ subject, topic }) {
  return {
    learningHub: createLearnDescriptor("hub", subject, topic),
    quickNotes: createLearnDescriptor("quickNotes", subject, topic),
    videos: createLearnDescriptor("videos", subject, topic),
    experiments: createLearnDescriptor("experiments", subject, topic),
    textbooks: createLearnDescriptor("textbooks", subject, topic),
    bookmarks: createLearnDescriptor("bookmarks", subject, topic),
  };
}
