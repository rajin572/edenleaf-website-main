import { FadeLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className=" isolate aspect-video h-screen bg-primary-color/40 backdrop-blur w-full flex justify-center items-center">
      <FadeLoader
        color="#0c3188
      "
      />
    </div>
  );
};

export default Loading;
