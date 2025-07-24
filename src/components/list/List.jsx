import { lazy, Suspense } from "react";
import "./list.scss";

const Card = lazy(() => import("../card/Card"));

function List({ savePosts = [], userPosts = [], handlePostUpdate }) {
  const combinedPosts = [
    ...userPosts.map((post) => ({ ...post, isOwner: true })),
    ...savePosts.map((post) => ({ ...post, isSaved: true })),
  ];
  return (
    <div className="list">
      <Suspense fallback={<div>Loading...</div>}>
        {combinedPosts.map((item) => (
          <Card key={item.id} item={item} handlePostUpdate={handlePostUpdate} />
        ))}
      </Suspense>
    </div>
  );
}

export default List;
