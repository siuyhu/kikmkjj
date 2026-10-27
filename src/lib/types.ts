export type DiaryEntry = {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  mood: string;
  created_at: string;
};

export type Photo = {
  id: string;
  user_id: string;
  author_name: string;
  caption: string;
  storage_path: string;
  created_at: string;
};

export type Wish = {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  done: boolean;
  created_at: string;
};

export type Countdown = {
  id: string;
  user_id: string;
  author_name: string;
  title: string;
  target_date: string; // YYYY-MM-DD
  created_at: string;
};
