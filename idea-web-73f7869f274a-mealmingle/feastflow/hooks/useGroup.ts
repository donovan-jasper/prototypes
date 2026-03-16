import { useState, useEffect } from 'react';
import { createGroup, fetchGroups, addGroupMember, fetchGroupMembers } from '../lib/database';

export const useGroup = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const createNewGroup = async (group) => {
    setLoading(true);
    return new Promise((resolve) => {
      createGroup(group, (newGroup) => {
        setGroups([...groups, newGroup]);
        setLoading(false);
        resolve(newGroup);
      });
    });
  };

  const loadGroups = () => {
    setLoading(true);
    fetchGroups((fetchedGroups) => {
      setGroups(fetchedGroups);
      setLoading(false);
    });
  };

  const addMemberToGroup = async (member) => {
    setLoading(true);
    return new Promise((resolve) => {
      addGroupMember(member, (newMember) => {
        const updatedGroups = groups.map(group => {
          if (group.id === member.groupId) {
            return {
              ...group,
              members: [...(group.members || []), newMember],
            };
          }
          return group;
        });
        setGroups(updatedGroups);
        setLoading(false);
        resolve(newMember);
      });
    });
  };

  const loadGroupMembers = (groupId) => {
    setLoading(true);
    fetchGroupMembers(groupId, (members) => {
      const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members,
          };
        }
        return group;
      });
      setGroups(updatedGroups);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return {
    groups,
    loading,
    createGroup: createNewGroup,
    fetchGroups: loadGroups,
    addGroupMember: addMemberToGroup,
    fetchGroupMembers: loadGroupMembers,
  };
};
