exports.createUser = async (req, res) => {
  const { name, email, role } = req.body 
  try {
    res.send('user created')
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
};
