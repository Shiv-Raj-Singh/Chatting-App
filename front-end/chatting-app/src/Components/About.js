import { Avatar, Box, Stack, Text, VStack } from "@chakra-ui/react";
import React from "react";

const avatarSrc = "https://scontent.fblr1-7.fna.fbcdn.net/v/t1.6435-9/167122131_744923853053586_3908649596771424280_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=730e14&_nc_ohc=u55MFz533uYAX8NYFKl&tn=BxaPr5aVLI56Jc-u&_nc_ht=scontent.fblr1-7.fna&oh=00_AfDjfNgyUiao1Z3ZZ_Q14Y5SUyArbEPbHXcrcU07T80XXQ&oe=640B270B";

const About = () => {
  return (
    <Box
      bgColor={"blackAlpha.900"}
      color={"whiteAlpha.700"}
      minH={"48"}
      px={"16"}
      py={["16", "8"]}
    >
      <Stack direction={["column", "row"]} h={"full"} alignItems={"center"}>
        <VStack w={"full"} alignItems={["center", "flex-start"]}>
          <Text fontWeight={"bold"}>About Us</Text>
          <Text
            fontSize={"sm"}
            letterSpacing={"widest"}
            textAlign={["center", "left"]}
          >
Our Chatting App is the Best Application Now You Should to use Once Our        
Chatting app allows you to communicate with your customers in web chat rooms. It enables you to send and receive messages.
          </Text>
        </VStack>

        <VStack>
          <Avatar boxSize={"50"} mt={["4", "0"]} src={avatarSrc} />
          <Text>Our Founder</Text>
        </VStack>
      </Stack>
    </Box>
  );
};

export default About;
