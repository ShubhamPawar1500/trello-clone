import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import CustomHeader from './CustomHeader';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { Portal } from 'react-native-paper';
import DateTimePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import { getStorage, removeAll, setStorage } from '../Utils/util_functions';

const LIST_WIDTH = 280;

const TrelloBoard = ({ navigation }) => {
  const [lists, setLists] = useState([
    // {
    //   id: '1',
    //   title: 'To Do',
    //   cards: [
    //     { id: '1', title: 'Task 1', description: 'Complete task 1', dueDate: new Date() },
    //     { id: '2', title: 'Task 2', description: 'Complete task 2', dueDate: new Date() },
    //   ]
    // },
    // {
    //   id: '2',
    //   title: 'In Progress',
    //   cards: [
    //     { id: '3', title: 'Task 3', description: 'Working on task 3', dueDate: new Date() },
    //   ]
    // },
    // {
    //   id: '3',
    //   title: 'Done',
    //   cards: [
    //     { id: '4', title: 'Task 4', description: 'Completed task 4', dueDate: new Date() },
    //   ]
    // }
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const defaultStyles = useDefaultStyles();


  const openCardModal = (card, listId) => {
    setSelectedCard(card);
    setSelectedListId(listId);
    setEditTitle(card.title);
    setEditDescription(card.description);
    setEditDueDate(card.dueDate);
    setModalVisible(true);
  };

  const closeCardModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
    setSelectedListId(null);
  };

  useEffect(() => {
    const getDataFromStorage = async () => {
      const data = await getStorage('data');
      if (data) {
        setLists(JSON.parse(data));
      }
    }

    getDataFromStorage()
  }, [])

  const saveCardChanges = async () => {
    if (editTitle.trim() === '') {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    const updatedLists = lists.map(list => {
      if (list.id === selectedListId) {
        return {
          ...list,
          cards: list.cards.map(card => {
            if (card.id === selectedCard.id) {
              return {
                ...card,
                title: editTitle,
                description: editDescription,
                dueDate: editDueDate
              };
            }
            return card;
          })
        };
      }
      return list;
    });

    setLists(updatedLists);
    closeCardModal();
    await setStorage('data', JSON.stringify(updatedLists));
  };

  const deleteCard = async () => {
    const updatedLists = lists.map(list => {
      if (list.id === selectedListId) {
        return {
          ...list,
          cards: list.cards.filter(card => card.id !== selectedCard.id)
        };
      }
      return list;
    });

    setLists(updatedLists);
    closeCardModal();
    await setStorage('data', JSON.stringify(updatedLists));
  };

  const addNewList = async () => {
    if (newListTitle.trim() === '') {
      Alert.alert('Error', 'List title cannot be empty');
      return;
    }

    const newList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      cards: []
    };

    setLists([...lists, newList]);
    await setStorage('data', JSON.stringify([...lists, newList]));
    setNewListTitle('');
    setAddingList(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Confirm Reset',
      'Are you sure you want to reset the board?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setLists([]);
            await removeAll();
          }
        }
      ]
    )
  }

  const deleteList = (listId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this list and all its cards?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let updated = lists.filter(list => list.id !== listId)
            setLists(updated);
            await setStorage('data', JSON.stringify(updated))
          }
        }
      ]
    );
  };

  const addCardToList = (listId) => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: 'New Card',
      description: '',
      dueDate: new Date()
    };

    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, newCard]
        };
      }
      return list;
    });

    setLists(updatedLists);
  };

  const onCardDragEnd = async (params, listId) => {
    const { data, from, to } = params;

    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: data
        };
      }
      return list;
    });

    setLists(updatedLists);
    await setStorage('data', JSON.stringify(updatedLists))
  };

  const renderCardItem = ({ item: card, drag, isActive }, listId) => {

    return (
      <ScaleDecorator activeScale={0.9}>
        <TouchableOpacity
          style={[
            styles.card,
            // isActive && styles.draggingCard
          ]}
          onLongPress={drag}
          disabled={isActive}
          onPress={() => openCardModal(card, listId)}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            {card.dueDate && (
              <Text style={styles.cardDueDate}>
                Due: {new Date(card.dueDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderList = ({ item: list, drag, isActive }) => {

    return (
      <ScaleDecorator activeScale={0.8}>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.list,
            // isActive && styles.draggingList,
            { height: 100 + (70 * list.cards.length) }
          ]}
        >
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{list.title}</Text>
            <TouchableOpacity onPress={() => deleteList(list.id)} style={styles.listDeleteButton}>
              <Text style={styles.listDeleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>

            <DraggableFlatList
              data={list.cards}
              keyExtractor={(item) => item.id}
              renderItem={(params) => renderCardItem(params, list.id)}
              onDragEnd={(params) => onCardDragEnd(params, list.id)}
            />
          </View>

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => addCardToList(list.id)}
          >
            <Text style={styles.addCardButtonText}>+ Add Card</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={'Trello Board'} menus={[{ icon: 'reload', func: handleReset }]} />

      <View style={{ flex: 1, marginVertical: 10 }}>
        <DraggableFlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderList}
          horizontal
          containerStyle={{ height: '100%' }}
          onDragEnd={async ({ data }) => { setLists(data); await setStorage('data', JSON.stringify(data)) }}
          ListFooterComponent={
            !addingList ? (
              <TouchableOpacity
                style={styles.addListButton}
                onPress={() => setAddingList(true)}
              >
                <Text style={styles.addListButtonText}>+ Add List</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.newListContainer}>
                <TextInput
                  style={styles.newListInput}
                  placeholder="Enter list title"
                  value={newListTitle}
                  onChangeText={setNewListTitle}
                  autoFocus
                />
                <View style={styles.newListButtonContainer}>
                  <TouchableOpacity
                    style={styles.saveListButton}
                    onPress={addNewList}
                  >
                    <Text style={styles.saveListButtonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelListButton}
                    onPress={() => {
                      setAddingList(false);
                      setNewListTitle('');
                    }}
                  >
                    <Text style={styles.cancelListButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }
        />
      </View>

      <Portal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeCardModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>

              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Card</Text>

                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Enter card title"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Enter card description"
                  multiline
                />

                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Text>{new Date(editDueDate).toDateString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={editDueDate}
                    mode="single"
                    styles={defaultStyles}
                    onChange={({ date }) => {
                      setShowDatePicker(false);
                      if (date) {
                        setEditDueDate(date);
                      }
                    }}
                    style={{ borderWidth: 1, borderRadius: 10 }}
                  />
                )}

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveCardChanges}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteCard}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeCardModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  boardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#026aa7',
    color: 'white',
    paddingTop: 20
  },
  boardContainer: {
    padding: 10,
    alignItems: 'flex-start',
  },
  list: {
    width: LIST_WIDTH,
    backgroundColor: '#222831',
    marginHorizontal: 10,
    borderRadius: 13,
    padding: 10,
    maxHeight: '95%',
  },
  draggingList: {
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listDeleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dfe1e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listDeleteButtonText: {
    fontSize: 18,
    color: '#6b778c',
  },
  cardContainer: {
    marginBottom: 10,
    maxHeight: '85%'
  },
  card: {
    backgroundColor: '#DFD0B8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    height: 62
  },
  draggingCard: {
    opacity: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  cardContent: {
    width: '100%',
  },
  cardTitle: {
    fontWeight: '500',
    marginBottom: 5,
  },
  cardDueDate: {
    fontSize: 12,
    color: '#5e6c84',
  },
  addCardButton: {
    padding: 10,
    backgroundColor: '#dfe1e6',
    borderRadius: 3,
    alignItems: 'center',
  },
  addCardButtonText: {
    color: '#172b4d',
  },
  addListButton: {
    width: 280,
    backgroundColor: '#dfe1e6',
    borderRadius: 3,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginHorizontal: 10,
  },
  addListButtonText: {
    color: '#172b4d',
    fontWeight: '500',
  },
  newListContainer: {
    width: 280,
    backgroundColor: '#ebecf0',
    borderRadius: 3,
    padding: 10,
    marginHorizontal: 10,
  },
  newListInput: {
    backgroundColor: 'white',
    borderRadius: 3,
    padding: 8,
    marginBottom: 10,
  },
  newListButtonContainer: {
    flexDirection: 'row',
  },
  saveListButton: {
    backgroundColor: '#0079bf',
    borderRadius: 3,
    padding: 8,
    marginRight: 10,
  },
  saveListButtonText: {
    color: 'white',
  },
  cancelListButton: {
    padding: 8,
  },
  cancelListButtonText: {
    color: '#6b778c',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 500,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputLabel: {
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#0079bf',
    borderRadius: 3,
    padding: 10,
    marginRight: 10,
  },
  saveButtonText: {
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#eb5a46',
    borderRadius: 3,
    padding: 10,
    marginRight: 10,
  },
  deleteButtonText: {
    color: 'white',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#6b778c',
  },
});

export default TrelloBoard;