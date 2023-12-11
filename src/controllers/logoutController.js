
export const logout =  async (req,res) =>{
    res.clearCookie("userSave");
    res.redirect("/");
}