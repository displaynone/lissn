import { IconProps } from "@/utils/types";
import Svg, { Ellipse, Rect } from "react-native-svg";

const Logo: React.FC<IconProps> = ({ size = 24, color = "black" }) => {
	return (
		<Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
			<Ellipse cx="18.827" cy="98.891" rx="4.2701" ry="4.3671" fill="#6e71e3" />
			<Ellipse cx="35.471" cy="98.882" rx="7.3756" ry="7.5432" fill="#5b9bee" />
			<Ellipse cx="188.02" cy="99.129" rx="4.2701" ry="4.3671" fill="#4fa1ec" />
			<Ellipse cx="171.45" cy="99.119" rx="7.3756" ry="7.5432" fill="#5554d3" />
			<Ellipse cx="56.101" cy="82.194" rx="7.9579" ry="8.0285" fill="#9acbee" />
			<Rect
				x="48.136"
				y="82.292"
				width="15.916"
				height="16.502"
				fill="#9acbee"
			/>
			<Rect
				x="48.276"
				y="95.573"
				width="15.916"
				height="14.169"
				fill="#c5c8f6"
			/>
			<Ellipse cx="56.417" cy="108.61" rx="7.9579" ry="8.0285" fill="#c5c8f6" />
			<Ellipse cx="56.076" cy="98.61" rx="7.9579" ry="8.0285" fill="#667bf0" />
			<Ellipse cx="150.42" cy="84.834" rx="7.9579" ry="8.0285" fill="#8dd7f0" />
			<Rect
				x="142.46"
				y="84.933"
				width="15.916"
				height="16.502"
				fill="#8dd7f0"
			/>
			<Rect
				x="142.58"
				y="101.97"
				width="15.916"
				height="10.189"
				fill="#afd8ec"
			/>
			<Ellipse cx="150.74" cy="112.31" rx="7.9579" ry="8.0285" fill="#afd8ec" />
			<Ellipse cx="150.4" cy="101.25" rx="7.9579" ry="8.0285" fill="#64bae7" />
			<Rect
				x="69.518"
				y="98.655"
				width="17.224"
				height="19.214"
				fill="#c3bef4"
			/>
			<Ellipse cx="78.173" cy="118.41" rx="8.5491" ry="8.5245" fill="#c3bef4" />
			<Ellipse cx="78.018" cy="102.17" rx="8.4923" ry="8.4534" fill="#8177e5" />
			<Ellipse cx="78.137" cy="68.528" rx="8.5491" ry="8.4902" fill="#99cbf3" />
			<Rect
				x="69.515"
				y="68.554"
				width="17.224"
				height="29.302"
				fill="#99cbf3"
			/>
			<Ellipse cx="78.136" cy="98.669" rx="8.6379" ry="8.7931" fill="#657ee1" />
			<Rect
				x="120.05"
				y="98.274"
				width="17.224"
				height="19.214"
				fill="#bacef1"
			/>
			<Ellipse cx="128.71" cy="118.03" rx="8.5491" ry="8.5245" fill="#bacef1" />
			<Ellipse cx="128.75" cy="102.03" rx="8.6864" ry="8.696" fill="#6b99e9" />
			<Ellipse cx="128.67" cy="68.147" rx="8.5491" ry="8.4902" fill="#97cff2" />
			<Rect
				x="120.05"
				y="68.173"
				width="17.224"
				height="29.302"
				fill="#97cff2"
			/>
			<Ellipse cx="128.72" cy="98.191" rx="8.6864" ry="8.696" fill="#5297e4" />
			<Rect
				x="92.048"
				y="44.571"
				width="22.783"
				height="33.557"
				fill="#84d3f2"
			/>
			<Rect
				x="92.048"
				y="97.996"
				width="22.783"
				height="33.557"
				fill="#9e7eed"
			/>
			<Rect
				x="92.048"
				y="71.162"
				width="22.783"
				height="26.077"
				fill="#588ee6"
			/>
			<Ellipse cx="103.44" cy="98.861" rx="11.428" ry="11.441" fill="#5c47be" />
			<Ellipse cx="103.44" cy="102.97" rx="11.428" ry="11.441" fill="#5c47be" />
			<Ellipse cx="103.44" cy="132.51" rx="11.428" ry="11.441" fill="#9e7eed" />
			<Ellipse cx="103.44" cy="71.309" rx="11.428" ry="11.441" fill="#588ee6" />
			<Ellipse cx="103.44" cy="44.869" rx="11.428" ry="11.441" fill="#84d3f2" />
			<Ellipse cx="150.4" cy="99.134" rx="7.9579" ry="8.0285" fill="#4eb1ea" />
		</Svg>
	);
};

export default Logo;