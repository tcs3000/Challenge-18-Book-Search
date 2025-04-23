import User from '../models/User';
import { signToken } from '../services/auth';
import { AuthenticationError } from 'apollo-server-express';

export const resolvers = {
  Query: {
    
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
      const user = await User.findById(context.user._id);
      return user;
    },
  },

  Mutation: {
    
    addUser: async (_parent: any, { username, email, password }: any) => {
      const user = await User.create({ username, email, password });

      if (!user) {
        throw new Error('Something went wrong!');
      }

      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    
    login: async (_parent: any, { email, password }: any) => {
      const user = await User.findOne({ $or: [{ email }, { username: email }] }); // supports 
      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken(user.username, user.password, user._id);
      return { token, user };
    },

    
    saveBook: async (_parent: any, { bookData }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    
    removeBook: async (_parent: any, { bookId }: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};
