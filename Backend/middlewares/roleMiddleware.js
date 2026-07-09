export const patientOnly = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only patients can access this route.' });
  }
};

export const doctorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only doctors can access this route.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only admins can access this route.' });
  }
};

export const nurseOnly = (req, res, next) => {
  if (req.user && req.user.role === 'nurse') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only nurses can access this route.' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Not authorized. Only ${roles.join(', ')} can access this route.` });
    }
  };
};
