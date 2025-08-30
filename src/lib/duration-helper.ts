import { Lesson, Chapter } from "@prisma/client";

/**
 * Parses a duration string (e.g., "10:30") into total seconds.
 * Returns 0 if the format is invalid or input is null.
 * @param durationString - The duration string in "MM:SS" format.
 * @returns The total number of seconds.
 */
const parseDurationToSeconds = (
  durationString: string | null | undefined
): number => {
  if (!durationString) return 0;
  const parts = durationString.split(":");
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds)) return 0;

  return minutes * 60 + seconds;
};

/**
 * Formats a total number of seconds into a human-readable string.
 * @param totalSeconds - The total duration in seconds.
 * @returns A formatted string (e.g., "12h 30m", "45m", "1h 0m").
 */
const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds === 0) return "0m";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  if (minutes > 0 || hours === 0) {
    formatted += `${minutes}m`;
  }

  return formatted.trim();
};

type ChapterWithLessons = Chapter & { lessons: Lesson[] };

/**
 * Calculates the total duration of a list of chapters (and their lessons).
 * @param chapters - An array of Chapter objects, each containing its Lessons.
 * @returns A formatted duration string (e.g., "12h 30m").
 */
export const calculateTotalCourseDuration = (
  chapters: ChapterWithLessons[]
): string => {
  const totalSeconds = chapters.reduce((courseTotal, chapter) => {
    const chapterTotal = chapter.lessons.reduce((chapterSum, lesson) => {
      return chapterSum + parseDurationToSeconds(lesson.duration);
    }, 0);
    return courseTotal + chapterTotal;
  }, 0);

  return formatDuration(totalSeconds);
};

/**
 * Calculates the total duration of a single chapter's lessons.
 * @param lessons - An array of Lesson objects.
 * @returns A formatted duration string (e.g., "45m").
 */
export const calculateChapterDuration = (lessons: Lesson[]): string => {
  const totalSeconds = lessons.reduce(
    (sum, lesson) => sum + parseDurationToSeconds(lesson.duration),
    0
  );
  return formatDuration(totalSeconds);
};
