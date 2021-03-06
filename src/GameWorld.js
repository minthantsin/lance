/**
 * This class represents an instance of the game world,
 * where all data pertaining to the current state of the
 * world is saved.
 */
class GameWorld {

    /**
     * Constructor of the World instance
     */
    constructor() {
        this.stepCount = 0;
        this.objects = {};
        this.playerCount = 0;
        this.idCount = 0;
    }

    /**
     * Gets a new, fresh and unused id that can be used for a new object
     * @return {Number} the new id
     */
    getNewId() {
        let possibleId = this.idCount;
        // find a free id
        while (possibleId in this.objects)
            possibleId++;

        this.idCount = possibleId + 1;
        return possibleId;
    }

    /**
     * Returns all the game world objects which match a criteria
     * @param {Object} query The query object
     * @param {Object} [query.id] object id
     * @param {Object} [query.playerId] player id
     * @param {Class} [query.instanceType] matches whether `object instanceof instanceType`
     * @param {Array} [query.components] An array of component names
     * @param {Boolean} [query.returnSingle] Return the first object matched
     * @returns {Array | Object} All game objects which match all the query parameters, or the first match if returnSingle was specified
     */
    queryObjects(query) {
        let queriedObjects = [];

        // todo this is currently a somewhat inefficient implementation for API testing purposes.
        // It should be implemented with cached dictionaries like in nano-ecs
        this.forEachObject((id, object) => {
            let conditions = [];

            // object id condition
            conditions.push(!('id' in query) || query.id && object.id === query.id);

            // player id condition
            conditions.push(!('playerId' in query) || query.playerId && object.playerId === query.playerId);

            // instance type conditio
            conditions.push(!('instanceType' in query) || query.instanceType && object instanceof query.instanceType);

            // components conditions
            if ('components' in query) {
                query.components.forEach(componentClass => {
                    conditions.push(object.hasComponent(componentClass));
                });
            }

            // all conditions are true, object is qualified for the query
            if (conditions.every(value => value)) {
                queriedObjects.push(object);
                if (query.returnSingle) return false;
            }
        });

        // return a single object or null
        if (query.returnSingle) {
            return queriedObjects.length > 0 ? queriedObjects[0] : null;
        }

        return queriedObjects;
    }

    /**
     * Returns The first game object encountered which matches a criteria.
     * Syntactic sugar for {@link queryObject} with `returnSingle: true`
     * @param query See queryObjects
     * @returns {Object}
     */
    queryObject(query) {
        return this.queryObjects(Object.assign(query, {
            returnSingle: true
        }));
    }

    /**
     * Remove an object from the game world
     * @param object
     */
    addObject(object) {
        this.objects[object.id] = object;
    }

    /**
     * Add an object to the game world
     * @param id
     */
    removeObject(id) {
        delete this.objects[id];
    }

    /**
     * World object iterator.
     * Invoke callback(objId, obj) for each object
     *
     * @param {function} callback function receives id and object. If callback returns false, the iteration will cease
     */
    forEachObject(callback) {
        for (let id of Object.keys(this.objects)) {
            let returnValue = callback(id, this.objects[id]);  // TODO: the key should be Number(id)
            if (returnValue === false) break;
        }
    }

}

export default GameWorld;
