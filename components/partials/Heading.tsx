import React from "react";
import { H1, XStack } from "tamagui";
import LogoIcon from "../icons/LogoIcon";

const Heading: React.FC = () => {
	return (
		<XStack gap={"$6"} alignItems="center">
			<LogoIcon size={48} />
			<H1 fontSize={"$5"} fontWeight="700">
				Lissn
			</H1>
		</XStack>
	);
};

export default Heading;
