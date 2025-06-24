const TeamCard = ({
  name,
  image,
}: {
  name: string;
  image: string;
}) => {
  return (
    <div
      className="relative w-[320px] h-[430px] flex flex-col gap-5 items-center p-8 text-white"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent font-bitter flex flex-col gap-5 ">
        <h3 className="text-3xl text-center font-light">{name}</h3>
      </div>
    </div>
  );
};

export default TeamCard;
