import Model from '../models';
import * as helpers from '../helpers';

const { Users, Followers } = Model;
const {
  ApplicationError,
  NotFoundError,
  paginator
} = helpers;


export default {
  /**
* Generic update profile
* @function
*
* @param {Object} request - express request object
* @param {Object} response - express response object
*
* @returns {Object} - callback that execute the controller
*/
  updateProfile: async (request, response) => {
    const {
      params: { id },
      body: payload
    } = request;

    if (request.user.id !== id) return response.status(401).json({ status: 'error', message: ' Unauthorized update' });

    const [, affectedRows] = await Users.update(
      { ...payload },
      { where: { id }, returning: true, raw: true }
    );

    delete affectedRows[0].password;

    return response.status(200).json({ status: 'success', message: 'Successfully updated', data: affectedRows[0] });
  },

  /**
   * Generic update profile
   *
   * @function
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - callback that execute the controller
   */
  viewProfile: async (request, response) => {
    const {
      params: { id }
    } = request;

    const existingUser = await Users.findOne({ where: { id }, raw: true });

    if (!existingUser) {
      return response.status(404).json({ status: 'error', message: 'User does not exist' });
    }

    delete existingUser.password;

    return response.status(200).json({ status: 'success', message: 'Request was successful', data: existingUser });
  },

  /**
    * A user can follow and unfollow a user
    * @function
    *
    * @param {Object} request - express request object
    * @param {Object} response - express response object
    *
    * @returns {Object} - callback that execute the controller
    */
  followAndUnfollow: async (request, response) => {
    const {
      params: { userId },
      user: { id }
    } = request;

    const userThatWantsToFollowOrUnfollow = id;
    const userToBeFollowedOrUnfollowed = await Users.findOne({ where: { id: userId } });

    if (!userToBeFollowedOrUnfollowed) throw new NotFoundError('User not found');
    if (userThatWantsToFollowOrUnfollow === userToBeFollowedOrUnfollowed.id) {
      throw new ApplicationError(409, 'User cannot perform this action');
    }

    const { firstName, lastName } = userToBeFollowedOrUnfollowed;

    let followerData = await Followers.findOne({
      where: {
        followeeId: userToBeFollowedOrUnfollowed.id,
        followerId: userThatWantsToFollowOrUnfollow,
      }
    });

    if (!followerData) {
      followerData = await Followers
        .create({
          followerId: userThatWantsToFollowOrUnfollow,
          followeeId: userToBeFollowedOrUnfollowed.id,
        });
    } else {
      followerData = await followerData.update({ active: !followerData.active, returning: true });
    }

    return response.status(200).json({
      status: 'success',
      message: `Successfully ${followerData.active ? 'unfollowed'
        : 'followed'} ${firstName} ${lastName}`,
      data: followerData.toJSON()
    });
  },

  /**
    *  Get all followers of a user
    * @function
    *
    * @param {Object} request - express request object
    * @param {Object} response - express response object
    *
    * @returns {Object} - callback that execute the controller
    */
  getAllFollowers: async (request, response) => {
    const {
      query: { page = 1, limit = 10 },
      params: { userId },
    } = request;

    const allFollowers = await paginator(null, {
      page,
      limit,
      dataSource: Users.getUserFollowers,
      dataToSource: { user: userId }
    });

    return response.status(200).json({
      status: 'success',
      message: 'Request successful',
      current: +page,
      allFollowers
    });
  },

  /**
    * Get all following of a user
    * @function
    *
    * @param {Object} request - express request object
    * @param {Object} response - express response object
    *
    * @returns {Object} - callback that execute the controller
    */
  getAllFollowings: async (request, response) => {
    const {
      query: { page = 1, limit = 10 },
      params: { userId },
    } = request;

    const allFollowings = await paginator(null, {
      page,
      limit,
      dataSource: Users.getUserFollowings,
      dataToSource: { user: userId }
    });

    return response.status(200).json({
      status: 'success',
      message: 'Request successful',
      current: +page,
      allFollowings
    });
  }
};
