export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  rent: string;
  mdate: Date;
  cost: string;
  creator: string;
  itemDate?: Date;
  isFree:  Boolean;
}
  