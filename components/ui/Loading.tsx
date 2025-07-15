import { Spinner, YStack } from "tamagui";

export const Loading: React.FC = () => {
  return (
    <YStack f={1} jc="center" ai="center" bg="$background">
      <Spinner size="large" color="$orange10" />
    </YStack>
  );
}