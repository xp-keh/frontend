import Image from "next/image";

const WeatherIcon = ({ description }: { description: string }) => {
  let iconSrc = "";
  let altText = "";

  if (description.toLowerCase().includes("cloud")) {
    iconSrc = "/clouds.png";
    altText = "Cloudy";
  } else if (description.toLowerCase().includes("light rain")) {
    iconSrc = "/light-rain.png";
    altText = "Light Rain";
  } else if (description.toLowerCase().includes("moderate rain")) {
    iconSrc = "/moderate-rain.png";
    altText = "Moderate Rain";
  } else if (description.toLowerCase().includes("heavy rain")) {
    iconSrc = "/thunderstorm.png";
    altText = "Thunderstorm";
  } else if (description.toLowerCase().includes("sun")) {
    iconSrc = "/sunny.png";
    altText = "Sunny";
  }

  if (!iconSrc) return null;

  return (
    <Image
      src={iconSrc}
      alt={altText}
      width={40}
      height={40}
      className="filter invert brightness-5"
    />
  );
};

export default WeatherIcon;
