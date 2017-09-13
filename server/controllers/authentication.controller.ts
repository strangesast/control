export function loginUser = async function(req, res, next) {
  let { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'missing username or password' });
    return;
  }
  let user = await mongo.collection('users').findOne({ username });
  if (!user) {
    res.status(401).json({ message: 'invalid username' });

  } else if (user.password == password) {
    let payload = { id: user['_id'], username };
    let token = jwt.sign(payload, secret, { expiresIn: '1d' });

    let applications = await getApplications(user);

    res.json({ token, user, applications });

  } else {
    res.status(401).json({ message: 'invalid password' });

  }
}
