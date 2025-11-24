import { Typography, Box, useTheme } from "@mui/material";
import { purple } from "@mui/material/colors";

const Header = ({ title, subtitle }) => {

  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        color="#7f53ea"
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color="white">
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;