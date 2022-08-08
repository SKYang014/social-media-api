const router = require('express').Router();

const {
    addThought,
    removeThought,
    addReaction,
    removeReaction
} = require('../../controllers/thought-controller');

router
    .route("/")
    .post(addThought)


router
    .route('/:userId/:thoughtId')
    .delete(removeThought);

// /api/comments/<pizzaId>/<commentId>
// Remember that after deleting a particular comment, you need 
//to know exactly which pizza that comment originated from.
router.route('/:thoughtId/reactions')
    .post(addReaction);

router.route('/:thoughtId/reactions/:reactionId')
    .delete(removeReaction)

module.exports = router;